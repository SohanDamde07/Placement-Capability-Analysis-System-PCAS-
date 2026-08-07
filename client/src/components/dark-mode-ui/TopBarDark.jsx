import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import api from '../../api/axios';

export default function TopBarDark() {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const downloadReport = async () => {
    setDownloading(true);
    try {
      const resp = await api.get('/api/report/download', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([resp.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PCAS_Report_Dark.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Could not generate report. Complete your profile first.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <header className="flex justify-between items-center py-4 px-8 sticky top-0 bg-surface/40 backdrop-blur-xl z-30 border-b border-white/5">
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline opacity-50 group-focus-within:text-primary group-focus-within:opacity-100 transition-all text-sm">search</span>
          <input
            className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm text-slate-200 focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-slate-500 backdrop-blur-md outline-none"
            placeholder="Search intelligent insights..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
          <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(74,225,118,0.5)] animate-pulse"></span>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">AI Optimum</span>
        </div>
        <div className="flex gap-2">
            <button
                onClick={downloadReport}
                disabled={downloading}
                title="Download Report"
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5 disabled:opacity-50"
            >
                <span className="material-symbols-outlined text-sm">{downloading ? 'hourglass_empty' : 'picture_as_pdf'}</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5">
                <span className="material-symbols-outlined text-sm">notifications</span>
            </button>
        </div>
        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/30 font-bold shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            {user?.name?.[0]?.toUpperCase() || 'S'}
        </div>
      </div>
    </header>
  );
}
