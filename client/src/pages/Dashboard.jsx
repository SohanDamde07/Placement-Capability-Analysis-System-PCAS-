import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PRSGauge from '../components/PRSGauge';
import DashboardDark from './dark-mode-ui/DashboardDark';

const metricCards = [
  { key:'technical',     label:'Technical',     icon:'code',           color:'indigo' },
  { key:'communication', label:'Communication',  icon:'record_voice_over', color:'orange' },
  { key:'projects',      label:'Projects',       icon:'folder_special', color:'green'  },
  { key:'internships',   label:'Internships',    icon:'work',           color:'red'    },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/profile').then(r => {
      setProfile(r.data.profile);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const prs   = profile?.prsScore   ?? 0;
  const cls   = profile?.classification ?? '—';
  const feat  = profile?.featureScores  ?? {};

  const colorMap = {
    indigo: { bg:'bg-indigo-50', text:'text-primary', bar:'bg-primary' },
    orange: { bg:'bg-orange-50', text:'text-tertiary',  bar:'bg-tertiary' },
    green:  { bg:'bg-green-50',  text:'text-secondary', bar:'bg-secondary' },
    red:    { bg:'bg-red-50',    text:'text-error',     bar:'bg-error' },
  };

  const clsBadge = cls === 'Placement Ready'
    ? 'bg-secondary-container text-on-secondary-container'
    : cls === 'Intermediate'
    ? 'bg-surface-container-high text-primary'
    : 'bg-error-container text-on-error-container';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );

  if (theme === 'dark') {
    return <DashboardDark profile={profile} loading={loading} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            Welcome back, {user?.name?.split(' ')[0]}.
          </h2>
          <p className="text-on-surface-variant mt-2 text-lg">
            {profile?.prsScore
              ? 'Your technical career readiness dashboard.'
              : 'Complete your Skill Profile to get your PRS score.'}
          </p>
        </div>
        {cls && cls !== '—' && (
          <div className={`px-4 py-2 rounded-full flex items-center gap-2 font-semibold text-sm ${clsBadge}`}>
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            {cls}
          </div>
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* PRS Gauge card */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-8 rounded-3xl shadow-sm relative overflow-hidden flex flex-col items-center justify-center min-h-[380px]">
          <div className="absolute top-8 left-8">
            <h3 className="text-lg font-bold font-headline">Readiness Score (PRS)</h3>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest">Composite Index</p>
          </div>
          <PRSGauge score={prs} size={220} />
          <div className="mt-8 grid grid-cols-3 gap-8 w-full max-w-sm">
            {[
              { label: 'Classification', val: cls || '—' },
              { label: 'Weekly Growth',  val: '+0.0%',   color: 'text-secondary' },
              { label: 'Profile Strength', val: prs >= 70 ? 'Elite' : prs >= 40 ? 'Growing' : 'Building' },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">{label}</p>
                <p className={`text-lg font-bold font-headline ${color || ''}`}>{val}</p>
              </div>
            ))}
          </div>
          {!profile?.prsScore && (
            <button
              onClick={() => navigate('/profile')}
              className="mt-6 px-8 py-3 rounded-xl text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
              style={{ background:'linear-gradient(135deg,#3525cd,#4f46e5)' }}
            >
              Complete Skill Profile
            </button>
          )}
        </div>

        {/* AI Insight card */}
        <div className="col-span-12 lg:col-span-4 bg-primary text-white p-8 rounded-3xl flex flex-col justify-between shadow-2xl shadow-primary/20">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-3xl">auto_awesome</span>
              <h3 className="font-bold font-headline text-xl">Intelligent Insight</h3>
            </div>
            <p className="text-lg leading-relaxed font-medium">
              {profile?.insights?.[0] || 'Complete your profile to receive AI-powered insights.'}
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-xs opacity-80 font-medium mb-4">RECOMMENDED NEXT STEP</p>
            <button
              onClick={() => navigate('/roadmap')}
              className="flex items-center justify-between group cursor-pointer w-full text-left"
            >
              <span className="font-semibold underline underline-offset-4">
                {profile?.insights?.[1] || 'Build your personalized roadmap'}
              </span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Metric cards */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map(({ key, label, icon, color }) => {
            const score = Math.round(feat[key] || 0);
            const c = colorMap[color];
            const diff = score - 65;
            return (
              <div key={key} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-xl ${c.bg} ${c.text}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                  </div>
                  <span className={`text-xs font-bold ${diff >= 0 ? 'text-secondary' : 'text-error'}`}>
                    {diff >= 0 ? '+' : ''}{diff}%
                  </span>
                </div>
                <h4 className="font-bold text-on-surface">{label}</h4>
                <div className="mt-4">
                  <span className="text-3xl font-black font-headline">{score}</span>
                  <div className="mt-2 h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
                    <div className={`h-full ${c.bar} rounded-full transition-all duration-1000`} style={{ width: `${score}%` }}></div>
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
