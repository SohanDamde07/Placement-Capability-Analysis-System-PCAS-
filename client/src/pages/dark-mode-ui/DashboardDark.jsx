import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PRSGauge from '../../components/PRSGauge';

export default function DashboardDark({ profile, loading }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const prs = profile?.prsScore ?? 0;
  const cls = profile?.classification ?? '—';
  const feat = profile?.featureScores ?? {};
  
  const metricCards = [
    { key:'technical',     label:'Technical',     icon:'code',           color:'primary' },
    { key:'communication', label:'Communication',  icon:'record_voice_over', color:'tertiary' },
    { key:'projects',      label:'Projects',       icon:'folder_special', color:'secondary'  },
    { key:'internships',   label:'Internships',    icon:'work',           color:'error'    },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <div>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            Welcome back, {user?.name?.split(' ')[0] || 'Alex'}.
          </h2>
          <p className="text-on-surface-variant mt-2 text-lg">
            {prs > 0 ? 'Your technical career readiness is peaking this month.' : 'Complete your Skill Profile to unlock the intelligent layer.'}
          </p>
        </div>
        {cls && cls !== '—' && (
          <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md text-slate-200 flex items-center gap-2 shadow-sm font-semibold text-sm border border-secondary/30 glow-border">
            <span className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="text-secondary">{cls}</span>
          </div>
        )}
      </div>

      {/* Bento Layout Content */}
      <div className="grid grid-cols-12 gap-6 relative z-10">
        {/* Main Gauge Card (Centerpiece) */}
        <div className="col-span-12 lg:col-span-8 glass-card p-8 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
          <div className="absolute top-8 left-8">
            <h3 className="text-lg font-bold font-headline text-on-surface">Readiness Score (PRS)</h3>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest">Composite Index</p>
          </div>
          
          {/* Decorative blur backgrounds */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-secondary/5 rounded-full blur-[80px]"></div>

          <div className="relative mt-4">
              {/* Note: I reused PRSGauge here but we will color it according to dark mode */}
              <PRSGauge score={prs} size={240} />
          </div>

          <div className="mt-8 grid grid-cols-3 gap-12 w-full max-w-lg z-10">
            <div className="text-center">
              <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Global Percentile</p>
              <p className="text-xl font-bold font-headline text-on-surface">94th</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Weekly Growth</p>
              <p className="text-xl font-bold font-headline text-secondary">+4.2%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Profile Strength</p>
              <p className="text-xl font-bold font-headline text-on-surface">{prs >= 70 ? 'Elite' : prs >= 40 ? 'Growing' : 'Building'}</p>
            </div>
          </div>
          {!profile?.prsScore && (
              <button
                onClick={() => navigate('/profile')}
                className="mt-8 relative z-10 px-8 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition-all shadow-[0_0_20px_rgba(129,140,248,0.2)]"
              >
                Complete Skill Profile
              </button>
          )}
        </div>

        {/* AI Insight Box */}
        <div className="col-span-12 lg:col-span-4 glass-card-accent text-white p-8 rounded-3xl flex flex-col justify-between shadow-indigo-500/10 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-3xl text-primary">auto_awesome</span>
              <h3 className="font-bold font-headline text-xl">Intelligent Insight</h3>
            </div>
            <p className="text-lg leading-relaxed font-medium">
              "{profile?.insights?.[0] || 'Complete your profile to receive intelligent AI insights mapping your current skills.'}"
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
            <p className="text-xs opacity-70 font-medium mb-4 uppercase tracking-widest text-primary">Recommended Next Step</p>
            <div onClick={() => navigate('/roadmap')} className="flex items-center justify-between group cursor-pointer">
              <span className="font-semibold underline underline-offset-4 decoration-white/30 hover:decoration-white transition-all text-sm">
                  {profile?.insights?.[1] || 'Initialize Your Roadmap'}
              </span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </div>
        </div>

        {/* Metric cards */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map(({ key, label, icon, color }) => {
            const score = Math.round(feat[key] || 0);
            const diff = score - 65;
            
            // Map the colors back to the exact tailwind classes used in dark HTML
            const colorClasses = {
                'primary': { text: 'text-primary', bg: 'bg-primary/20', border: 'border-primary/20', hover: 'hover:border-primary/30', bar: 'bg-primary shadow-[0_0_8px_rgba(129,140,248,0.5)]' },
                'tertiary': { text: 'text-tertiary', bg: 'bg-tertiary/20', border: 'border-tertiary/20', hover: 'hover:border-tertiary/30', bar: 'bg-tertiary' },
                'secondary': { text: 'text-secondary', bg: 'bg-secondary/20', border: 'border-secondary/20', hover: 'hover:border-secondary/30', bar: 'bg-secondary shadow-[0_0_8px_rgba(74,225,118,0.5)]' },
                'error': { text: 'text-error', bg: 'bg-error/20', border: 'border-error/20', hover: 'hover:border-error/30', bar: 'bg-error' },
            }[color];

            return (
              <div key={key} className={`glass-card p-6 rounded-2xl transition-all group hover:bg-white/10 ${colorClasses.hover}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-xl ${colorClasses.bg} ${colorClasses.text} border ${colorClasses.border}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                  </div>
                  <span className={`text-xs font-bold ${diff >= 0 ? 'text-secondary' : 'text-error'}`}>
                    {diff >= 0 ? '+' : ''}{diff}%
                  </span>
                </div>
                <h4 className="font-bold text-on-surface">{label}</h4>
                <div className="mt-4">
                  <span className="text-3xl font-black font-headline text-on-surface">{score}</span>
                  <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${colorClasses.bar} rounded-full transition-all duration-1000`} style={{ width: `${score}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
