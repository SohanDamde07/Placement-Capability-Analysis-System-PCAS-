import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AIAssistantDark from './dark-mode-ui/AIAssistantDark';

const QUICK_ACTIONS = [
  { label:'How to improve PRS?',    icon:'psychology'       },
  { label:'Suggest roadmap',         icon:'alt_route'        },
  { label:'Improve my skills',       icon:'code'             },
  { label:'Internship tips',         icon:'work'             },
  { label:'Analyze my profile',      icon:'description'      },
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {isUser ? (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold text-sm flex-shrink-0">U</div>
      ) : (
        <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings:"'FILL' 1" }}>auto_awesome</span>
        </div>
      )}
      <div className={isUser
        ? 'bg-primary text-white p-5 rounded-2xl rounded-tr-none shadow-lg max-w-xl'
        : 'bg-surface-container-lowest p-5 rounded-2xl rounded-tl-none shadow-sm border border-outline-variant/15 max-w-2xl'
      }>
        <p className="leading-relaxed text-sm whitespace-pre-line">
          {msg.content}
        </p>
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello, ${user?.name?.split(' ')[0] || 'Student'}! 👋\n\nI'm your PCAS AI Assistant. I can help you:\n• Understand your PRS score\n• Get personalized roadmap suggestions\n• Improve specific skill areas\n• Find internship opportunities\n\nAsk me anything about your placement readiness!`,
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setSending(true);
    setMessages(m => [...m, { role:'user', content: msg }]);
    try {
      const r = await api.post('/api/assistant/chat', { message: msg });
      setMessages(m => [...m, { role:'assistant', content: r.data.response }]);
    } catch {
      setMessages(m => [...m, { role:'assistant', content:'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  if (theme === 'dark') {
    return <AIAssistantDark QUICK_ACTIONS={QUICK_ACTIONS} messages={messages} input={input} setInput={setInput} sending={sending} sendMessage={sendMessage} bottomRef={bottomRef} />;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <section className="max-w-4xl w-full mx-auto text-center py-8">
        <h2 className="text-4xl md:text-5xl font-extrabold font-headline text-on-surface tracking-tight mb-3">
          What&rsquo;s the next <span className="text-primary italic">breakthrough</span>?
        </h2>
        <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
          I&rsquo;m your cognitive partner, bridging the gap between your current skills and your professional destiny.
        </p>
      </section>

      {/* Messages */}
      <div className="max-w-4xl w-full mx-auto flex-1 space-y-6 pb-48">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {sending && (
          <div className="flex items-center gap-3 pl-14 text-on-surface-variant/60">
            <div className="flex gap-1 items-center">
              {[0, 75, 150].map(d => (
                <div key={d} className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay:`${d}ms` }}></div>
              ))}
            </div>
            <span className="text-xs font-medium italic">PCAS is analyzing your profile…</span>
          </div>
        )}
        <div ref={bottomRef}></div>
      </div>

      {/* Sticky input */}
      <div className="fixed bottom-0 left-72 right-8 pb-8 pt-4 bg-gradient-to-t from-surface via-surface/95 to-transparent">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Quick action chips */}
          <div className="flex flex-wrap gap-2 justify-center">
            {QUICK_ACTIONS.map(({ label, icon }) => (
              <button key={label} onClick={() => sendMessage(label)}
                className="px-4 py-2 bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/50 text-on-surface text-sm font-medium rounded-full transition-all shadow-sm flex items-center gap-2 group">
                <span className="material-symbols-outlined text-primary text-base opacity-60 group-hover:opacity-100">{icon}</span>
                {label}
              </button>
            ))}
          </div>
          {/* Input box */}
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/5 blur-xl group-focus-within:bg-primary/10 transition-all rounded-3xl"></div>
            <div className="relative bg-surface-container-lowest border border-outline-variant/30 rounded-2xl flex items-center p-2 shadow-2xl shadow-indigo-500/5">
              <span className="p-3 text-on-surface-variant material-symbols-outlined">psychology</span>
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/60 px-2 text-sm outline-none"
                placeholder="Ask anything about your career path…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={sending || !input.trim()}
                className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
              >
                <span className="material-symbols-outlined">arrow_upward</span>
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-on-surface-variant opacity-50 uppercase tracking-widest font-bold">
            Powered by PCAS AI Engine v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
