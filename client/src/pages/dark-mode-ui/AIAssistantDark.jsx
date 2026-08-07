import { useAuth } from '../../context/AuthContext';
import React from 'react';

function MessageDark({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {isUser ? (
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 border border-primary/30 shadow-[0_0_10px_rgba(129,140,248,0.2)]">U</div>
      ) : (
        <div className="w-10 h-10 rounded-xl bg-surface/80 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/5 relative glow-border ai-float-glow">
          <span className="material-symbols-outlined text-transparent bg-clip-text bg-gradient-to-tr from-primary to-primary-container" style={{ fontVariationSettings:"'FILL' 1" }}>auto_awesome</span>
        </div>
      )}
      <div className={isUser
        ? 'glass-card-accent text-white p-5 rounded-2xl rounded-tr-none shadow-[0_0_20px_rgba(129,140,248,0.1)] max-w-xl border border-primary/20 backdrop-blur-xl'
        : 'glass-card p-5 rounded-2xl rounded-tl-none shadow-sm border border-white/5 max-w-2xl text-slate-300 relative'
      }>
        <p className="leading-relaxed text-sm whitespace-pre-line font-label">
          {msg.content}
        </p>
      </div>
    </div>
  );
}

export default function AIAssistantDark({ QUICK_ACTIONS, messages, input, setInput, sending, sendMessage, bottomRef }) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] relative">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      {/* Header */}
      <section className="max-w-4xl w-full mx-auto text-center py-10 relative z-10 animate-in fade-in duration-700">
        <h2 className="text-4xl md:text-5xl font-extrabold font-headline text-slate-100 tracking-tight mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          Initiate <span className="text-primary italic inline-block drop-shadow-[0_0_20px_rgba(129,140,248,0.5)]">cognitive</span> protocol.
        </h2>
        <p className="text-slate-400 text-lg max-w-xl mx-auto font-label leading-relaxed">
          The PCAS intelligent layer is online. Interrogate the simulation to optimize your placement vectors.
        </p>
      </section>

      {/* Messages Array */}
      <div className="max-w-4xl w-full mx-auto flex-1 space-y-6 pb-48 relative z-10 p-4">
        {messages.map((msg, i) => <MessageDark key={i} msg={msg} />)}
        
        {sending && (
          <div className="flex items-center gap-3 pl-14 text-primary/60 font-label">
            <div className="flex gap-1 items-center">
              {[0, 75, 150].map(d => (
                <div key={d} className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_5px_rgba(129,140,248,0.5)]" style={{ animationDelay:`${d}ms` }}></div>
              ))}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]">Processing NLP vector...</span>
          </div>
        )}
        <div ref={bottomRef}></div>
      </div>

      {/* Persistent Input Interface */}
      <div className="fixed bottom-4 left-[18rem] right-8 pb-4 pt-12 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent z-40">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Quick Action Matrix */}
          <div className="flex flex-wrap gap-2 justify-center">
            {QUICK_ACTIONS.map(({ label, icon }) => (
              <button key={label} onClick={() => sendMessage(label)}
                className="px-5 py-2.5 glass-input border border-white/5 hover:border-primary/40 hover:bg-white/5 text-slate-300 text-xs font-bold rounded-full transition-all flex items-center gap-2 group backdrop-blur-xl">
                <span className="material-symbols-outlined text-primary text-sm opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-[0_0_8px_rgba(129,140,248,0.3)]">{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Core Input Node */}
          <div className="relative group mx-4">
            <div className="absolute inset-0 bg-primary/20 blur-2xl group-focus-within:bg-primary/30 transition-all rounded-3xl opacity-50"></div>
            <div className="relative glass-card border border-white/10 rounded-2xl flex items-center p-2 shadow-[0_15px_50px_rgba(0,0,0,0.5)] glow-border">
              <span className="p-3 text-primary animate-pulse material-symbols-outlined ml-2 drop-shadow-[0_0_10px_rgba(129,140,248,0.6)]">stream</span>
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 placeholder:text-slate-500 placeholder:font-label font-medium px-2 text-sm outline-none"
                placeholder="Query the intelligent layer..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={sending || !input.trim()}
                className="p-3 bg-white/10 text-white rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-white/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 border border-white/10 mr-1 flex items-center justify-center glow-border"
              >
                <span className="material-symbols-outlined text-sm">arrow_upward</span>
              </button>
            </div>
          </div>
          
          {/* Status Label */}
          <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold font-label">
            Cognitive Engine Active <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary ml-1 ai-float-glow shadow-[0_0_8px_rgba(74,225,118,0.8)]"></span>
          </p>
        </div>
      </div>
    </div>
  );
}
