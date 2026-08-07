const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/profile',   require('./routes/profile'));
app.use('/api/analysis',  require('./routes/analysis'));
app.use('/api/analyze',   require('./routes/analyze'));
app.use('/analyze',       require('./routes/analyze'));
app.use('/api/roadmap',   require('./routes/roadmap'));
app.use('/api/assistant', require('./routes/assistant'));
app.use('/api/report',    require('./routes/report'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pcas';

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`🚀 PCAS Server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} is busy — killing old process and retrying...`);
      const { execSync } = require('child_process');
      try {
        execSync(`npx -y kill-port ${port}`, { stdio: 'ignore', timeout: 10000 });
      } catch (_) {}
      setTimeout(() => startServer(port), 2000);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });
}

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ MongoDB connected locally (mongodb://localhost:27017/pcas)');
  } catch (err) {
    console.warn('⚠️ Local MongoDB unreachable. Starting embedded in-memory MongoDB server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log(`✅ Connected to Embedded In-Memory MongoDB (${memoryUri})`);
    } catch (memErr) {
      console.error('❌ MongoDB connection error:', memErr.message);
      process.exit(1);
    }
  }
  startServer(PORT);
}

connectDB();

module.exports = app;
