import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useTheme } from '../context/ThemeContext';
import PRSAnalysisDark from './dark-mode-ui/PRSAnalysisDark';

const AXES = ['technical','projects','internships','communication','academics'];
const AXIS_LABELS = { technical:'Technical', projects:'Projects', internships:'Internships', communication:'Communication', academics:'Academics' };

// Simple CSS polygon radar chart
function RadarChart({ user, avg, target }) {
  const size = 240;
  const cx = size / 2, cy = size / 2, R = 90;
  const angleStep = (2 * Math.PI) / AXES.length;

  const toXY = (val, i) => {
    const angle = i * angleStep - Math.PI / 2;
    return [cx + (val / 100) * R * Math.cos(angle), cy + (val / 100) * R * Math.sin(angle)];
  };

  const polygon = (scores, color, opacity) => {
    const pts = AXES.map((k, i) => toXY(scores[k] || 0, i).join(',')).join(' ');
    return <polygon points={pts} fill={color} fillOpacity={opacity} stroke={color} strokeWidth="1.5" />;
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const ringPolygons = rings.map(r => {
    const pts = AXES.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return `${cx + r * R * Math.cos(angle)},${cy + r * R * Math.sin(angle)}`;
    }).join(' ');
    return <polygon key={r} points={pts} fill="none" stroke="#e5eeff" strokeWidth="1" />;
  });

  const axes = AXES.map((_, i) => {
    const [x2, y2] = toXY(100, i);
    const [lx, ly] = toXY(115, i);
    const label = AXIS_LABELS[AXES[i]];
    return (
      <g key={i}>
        <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#c7c4d8" strokeWidth="1" />
        <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="bold" fill="#464555" fontFamily="Inter">
          {label}
        </text>
      </g>
    );
  });

  return (
    <svg width={size + 80} height={size + 60} style={{ overflow:'visible', marginLeft:30 }}>
      <g transform="translate(40,30)">
        {ringPolygons}{axes}
        {polygon(avg, '#c7c4d8', 0.3)}
        {polygon(target, '#4ae176', 0.15)}
        {polygon(user, '#3525cd', 0.35)}
      </g>
    </svg>
  );
}

export default function PRSAnalysis() {
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/analysis').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (theme === 'dark') {
    return <PRSAnalysisDark data={data} loading={loading} />;
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );

  if (!data?.analyzed) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <span className="material-symbols-outlined text-5xl text-outline">leaderboard</span>
      <p className="text-lg font-medium text-on-surface-variant">No analysis data yet.</p>
      <p className="text-sm text-outline">Complete your Skill Profile to get your PRS Analysis.</p>
    </div>
  );

  const { userScores, avgScores, targetScores, breakdown, insights, prsScore, classification, aiStrengths, aiWeaknesses, suggestedRole } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-2">
            <span>Analytics</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-primary font-semibold uppercase tracking-wide">PRS Analysis</span>
          </nav>
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">Performance Radar Score</h1>
          <p className="text-on-surface-variant mt-1 text-lg">Intelligent evaluation of multi-dimensional skill sets.{suggestedRole ? ` • Suggested: ${suggestedRole}` : ''}</p>
        </div>
        <div className="text-right">
          <p className="text-5xl font-black font-headline text-primary">{prsScore?.toFixed(1)}</p>
          <p className="text-sm font-semibold text-on-surface-variant">{classification}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Radar chart */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-on-surface">Interactive Analysis</h3>
              <p className="text-sm text-on-surface-variant">Comparative skill distribution</p>
            </div>
            <div className="flex gap-4 text-xs font-medium">
              {[['#3525cd','You'],['#4ae176','Target'],['#c7c4d8','Avg']].map(([c,l]) => (
                <div key={l} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ background:c }}></div>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <RadarChart user={userScores} avg={avgScores} target={targetScores} />
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="bg-surface-container-low rounded-3xl p-6 hover:bg-surface-container-high transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-secondary-container rounded-xl text-on-secondary-container">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <h3 className="text-lg font-bold">Key Strengths</h3>
            </div>
            <ul className="space-y-3">
              {aiStrengths?.length > 0
                ? aiStrengths.slice(0, 3).map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-secondary shrink-0"></span>
                      <p className="font-bold text-sm">{s}</p>
                    </li>
                  ))
                : breakdown?.filter(b => b.yourScore >= b.avgMarket).slice(0, 2).map(b => (
                    <li key={b.parameter} className="flex items-start gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-secondary shrink-0"></span>
                      <div>
                        <p className="font-bold text-sm">{b.parameter}</p>
                        <p className="text-xs text-on-surface-variant">{b.yourScore}/100 — {b.delta >= 0 ? '+' : ''}{b.delta}% vs market avg</p>
                      </div>
                    </li>
                  )) || <li className="text-sm text-on-surface-variant">Complete profile to see strengths</li>}
            </ul>
          </div>
          <div className="bg-surface-container-low rounded-3xl p-6 hover:bg-surface-container-high transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-error-container rounded-xl text-on-error-container">
                <span className="material-symbols-outlined">trending_down</span>
              </div>
              <h3 className="text-lg font-bold">Growth Areas</h3>
            </div>
            <ul className="space-y-3">
              {aiWeaknesses?.length > 0
                ? aiWeaknesses.slice(0, 3).map((w, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-error shrink-0"></span>
                      <p className="font-bold text-sm">{w}</p>
                    </li>
                  ))
                : breakdown?.filter(b => b.yourScore < b.avgMarket).slice(0, 2).map(b => (
                    <li key={b.parameter} className="flex items-start gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-error shrink-0"></span>
                      <div>
                        <p className="font-bold text-sm">{b.parameter}</p>
                        <p className="text-xs text-on-surface-variant">{b.yourScore}/100 — {b.delta}% vs market avg</p>
                      </div>
                    </li>
                  )) || <li className="text-sm text-on-surface-variant">Complete profile to see growth areas</li>}
            </ul>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="col-span-12 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center gap-10 relative overflow-hidden" style={{ background:'#1e1b4b' }}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-20 blur-[100px]"></div>
          <div className="relative z-10 md:w-1/3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
              <span className="material-symbols-outlined text-sm">auto_awesome</span> AI Optimization
            </div>
            <h2 className="text-3xl font-black mb-4 font-headline">Top Actions to Peak PRS Score</h2>
            <p className="text-indigo-200 leading-relaxed text-sm">
              Our ML layer calculated the most impactful changes to your skill profile.
            </p>
          </div>
          <div className="relative z-10 md:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {(insights || []).slice(0, 3).map((ins, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col gap-3">
                <span className="text-4xl font-black text-white/20">0{i + 1}</span>
                <p className="font-bold text-sm">{ins}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Parameter breakdown table */}
        <div className="col-span-12 bg-surface-container-lowest rounded-3xl p-8 shadow-sm overflow-hidden">
          <h3 className="text-xl font-bold mb-6">Parameter Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-on-surface-variant text-[10px] uppercase tracking-widest">
                  {['Parameter','Your Score','Avg Market','Target Path','Trend'].map(h => (
                    <th key={h} className={`px-6 py-3 font-bold ${h === 'Trend' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                {(breakdown || []).map(row => (
                  <tr key={row.parameter} className="group hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 rounded-l-2xl font-bold">{row.parameter}</td>
                    <td className="px-6 py-4"><span className="font-mono font-bold text-primary">{row.yourScore}/100</span></td>
                    <td className="px-6 py-4 text-on-surface-variant">{row.avgMarket}/100</td>
                    <td className="px-6 py-4">
                      <div className="w-28 h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width:`${Math.min(row.yourScore / row.targetPath * 100, 100)}%` }}></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 rounded-r-2xl text-right">
                      <span className={`font-bold flex items-center justify-end gap-1 ${row.trend === 'up' ? 'text-secondary' : 'text-error'}`}>
                        <span className="material-symbols-outlined text-xs">{row.trend === 'up' ? 'north' : 'south'}</span>
                        {row.delta >= 0 ? '+' : ''}{row.delta}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
