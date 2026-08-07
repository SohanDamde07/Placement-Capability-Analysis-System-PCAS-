import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';
import { useState } from 'react';

export default function TopBar() {
  const { user } = useAuth();
  const { toggleTheme } = useTheme();
  const loc = useLocation();
  const [downloading, setDownloading] = useState(false);

  const pageTitles = {
    '/dashboard': 'Home',
    '/profile':   'Skill Profile',
    '/analysis':  'Analytics',
    '/roadmap':   'Roadmap',
    '/assistant': 'AI Assistant',
  };
  const title = pageTitles[loc.pathname] || 'PCAS';

  const downloadReport = async () => {
    setDownloading(true);
    try {
      const resp = await api.get('/api/report/download', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([resp.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PCAS_Report.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Could not generate report. Complete your profile first.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <header className="flex justify-between items-center py-4 px-6 sticky top-0 bg-surface/80 backdrop-blur-md z-30">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input
            className="w-full bg-surface-container border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            placeholder="Search insights..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span className="text-xs font-bold text-on-surface uppercase tracking-wide">AI Online</span>
        </div>
        <button
          onClick={toggleTheme}
          title="Switch to Dark Mode"
          className="flex items-center gap-1 px-3 py-1.5 bg-surface-variant text-on-surface-variant text-xs font-bold rounded-lg hover:scale-105 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-sm">dark_mode</span>
        </button>
        <button
          onClick={downloadReport}
          disabled={downloading}
          title="Download PDF Report"
          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-sm">{downloading ? 'hourglass_empty' : 'picture_as_pdf'}</span>
          <span className="hidden md:inline">{downloading ? 'Generating…' : 'Export PDF'}</span>
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold text-sm shadow">
          {user?.name?.[0]?.toUpperCase() || 'S'}
        </div>
      </div>
    </header>
  );
}
