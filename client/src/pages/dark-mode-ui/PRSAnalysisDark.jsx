import React from 'react';

const AXES = ['technical','projects','internships','communication','academics'];
const AXIS_LABELS = { technical:'Technical', projects:'Projects', internships:'Internships', communication:'Communication', academics:'Academics' };

function RadarChartDark({ user, avg, target }) {
  const size = 260;
  const cx = size / 2, cy = size / 2, R = 100;
  const angleStep = (2 * Math.PI) / AXES.length;

  const toXY = (val, i) => {
    const angle = i * angleStep - Math.PI / 2;
    return [cx + (val / 100) * R * Math.cos(angle), cy + (val / 100) * R * Math.sin(angle)];
  };

  const polygon = (scores, color, opacity, strokeW = 1.5, strokeColor = color) => {
    const pts = AXES.map((k, i) => toXY(scores[k] || 0, i).join(',')).join(' ');
    return <polygon points={pts} fill={color} fillOpacity={opacity} stroke={strokeColor} strokeWidth={strokeW} style={{ filter: 'drop-shadow(0 0 8px rgba(129, 140, 248, 0.4))' }} />;
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const ringPolygons = rings.map(r => {
    const pts = AXES.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return `${cx + r * R * Math.cos(angle)},${cy + r * R * Math.sin(angle)}`;
    }).join(' ');
    return <polygon key={r} points={pts} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
  });

  const axes = AXES.map((_, i) => {
    const [x2, y2] = toXY(100, i);
    const [lx, ly] = toXY(120, i);
    const label = AXIS_LABELS[AXES[i]];
    return (
      <g key={i}>
        <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="bold" fill="rgba(255,255,255,0.5)" fontFamily="Inter" className="uppercase tracking-widest">
          {label}
        </text>
      </g>
    );
  });

  return (
    <svg width={size + 100} height={size + 80} style={{ overflow:'visible', marginLeft: 50 }}>
      {/* Decorative Glow Behind SVG */}
      <circle cx={cx + 50} cy={cy + 40} r={R} fill="currentColor" className="text-primary/5 blur-3xl"></circle>
      <g transform="translate(50,40)">
        {ringPolygons}{axes}
        {polygon(avg, 'rgba(148, 163, 184, 0.5)', 0.1, 1, 'rgba(148, 163, 184, 0.3)')}
        {polygon(target, 'rgba(74, 225, 118, 0.5)', 0.15, 1, 'rgba(74, 225, 118, 0.6)')}
        {polygon(user, '#818cf8', 0.25, 2, '#818cf8')}
      </g>
    </svg>
  );
}

export default function PRSAnalysisDark({ data, loading }) {
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );

  if (!data?.analyzed) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 w-full text-slate-400">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 relative ai-float-glow">
          <span className="material-symbols-outlined text-4xl text-primary">leaderboard</span>
      </div>
      <p className="text-xl font-headline font-bold text-slate-200 mt-4">Awaiting Analysis Parameters</p>
      <p className="text-sm font-label">Sync your Skill Profile to initialize intelligent PRS calculations.</p>
    </div>
  );

  const { userScores, avgScores, targetScores, breakdown, insights, prsScore, classification, aiStrengths, aiWeaknesses, suggestedRole } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-end relative z-10">
        <div>
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant font-label mb-2">
            <span className="text-slate-400">Analytics Space</span>
            <span className="material-symbols-outlined text-[10px] text-slate-500">chevron_right</span>
            <span className="text-primary font-bold uppercase tracking-widest drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]">PRS Analysis Matrix</span>
          </nav>
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">Placement Readiness Analytics</h1>
          <p className="text-slate-400 mt-2 text-lg font-label">Predictive modeling of multi-dimensional tech skill sets.{suggestedRole ? ` • Suggested: ${suggestedRole}` : ''}</p>
        </div>
        <div className="text-right glass-card px-6 py-4 rounded-2xl glow-border">
          <p className="text-xs text-primary font-bold uppercase tracking-widest mb-1">Index Score</p>
          <p className="text-5xl font-black font-headline text-slate-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              {prsScore?.toFixed(1)}
          </p>
          <div className="mt-2 text-xs font-bold px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded-full inline-block">
              {classification}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 relative z-10">
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

        {/* Radar Chart Section */}
        <div className="col-span-12 lg:col-span-7 glass-card rounded-3xl p-8 glow-border relative overflow-hidden">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-bold font-headline text-slate-200">Interactive Neural Distribution</h3>
              <p className="text-sm font-label text-slate-400 mt-1">Comparative topological skill mapping</p>
            </div>
            <div className="flex flex-col gap-2 text-xs font-label">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary shadow-[0_0_8px_rgba(129,140,248,0.6)]"></div><span className="text-slate-300">Your Vector</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded border border-secondary bg-secondary/50"></div><span className="text-slate-400">Target Trajectory</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded border border-slate-500 bg-slate-500/50"></div><span className="text-slate-400">Market Baseline</span></div>
            </div>
          </div>
          <div className="flex justify-center relative">
              <RadarChartDark user={userScores} avg={avgScores} target={targetScores} />
          </div>
        </div>

        {/* AI Insight Sidebar */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="glass-card-accent p-6 rounded-3xl rounded-tr-[4rem] relative overflow-hidden flex-1 glow-border group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-colors duration-700"></div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <h3 className="text-xl font-bold font-headline text-slate-200">Dominant Vectors</h3>
            </div>
            <ul className="space-y-4 relative z-10 font-label text-sm text-slate-300">
              {aiStrengths?.length > 0
                ? aiStrengths.slice(0, 3).map((s, i) => (
                    <li key={i} className="flex flex-col gap-1 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                      <span className="font-bold">{s}</span>
                    </li>
                  ))
                : breakdown?.filter(b => b.yourScore >= b.avgMarket).slice(0, 3).map(b => (
                    <li key={b.parameter} className="flex flex-col gap-1 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                        <div className="flex justify-between font-bold">
                            <span>{b.parameter}</span>
                            <span className="text-white bg-white/10 px-2 py-0.5 rounded text-[10px]">{b.yourScore}/100</span>
                        </div>
                        <p className="text-xs text-secondary flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">arrow_outward</span>
                            {b.delta >= 0 ? '+' : ''}{b.delta}% vs average
                        </p>
                    </li>
                )) || <li className="text-slate-500">Awaiting vector stabilization</li>}
            </ul>
          </div>
          
          <div className="glass-card p-6 rounded-3xl relative overflow-hidden flex-1 glow-border group">
             <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error border border-error/20">
                <span className="material-symbols-outlined">radar</span>
              </div>
              <h3 className="text-xl font-bold font-headline text-slate-200">Critical Growth Nodes</h3>
            </div>
            <ul className="space-y-4 relative z-10 font-label text-sm text-slate-300">
              {aiWeaknesses?.length > 0
                ? aiWeaknesses.slice(0, 3).map((w, i) => (
                    <li key={i} className="flex flex-col gap-1">
                      <span className="font-bold">{w}</span>
                    </li>
                  ))
                : breakdown?.filter(b => b.yourScore < b.avgMarket).slice(0, 2).map(b => (
                    <li key={b.parameter} className="flex flex-col gap-1">
                        <div className="flex justify-between font-bold">
                            <span>{b.parameter}</span>
                            <span className="text-error bg-error/10 border border-error/20 px-2 py-0.5 rounded text-[10px]">Gap: {Math.abs(b.delta)}%</span>
                        </div>
                        <div className="w-full h-1 mt-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-error rounded-full" style={{ width: `${b.yourScore}%` }}></div>
                        </div>
                    </li>
                )) || <li className="text-slate-500">No critical anomalies</li>}
            </ul>
          </div>
        </div>

        {/* Neural Directives Panel */}
        <div className="col-span-12 glass-card rounded-3xl p-8 relative overflow-hidden glow-border">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row gap-8 relative z-10 items-center">
            <div className="md:w-1/3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest mb-4 backdrop-blur-md glow-border">
                    <span className="material-symbols-outlined text-[12px] animate-pulse">model_training</span> Directives generated
                </div>
                <h2 className="text-3xl font-black mb-2 font-headline text-slate-100">Algorithmic Optimization</h2>
                <p className="text-slate-400 font-label text-sm leading-relaxed">
                    The cognitive engine has compiled specific trajectory adjustments to maximize your Placement Readiness Index over the next sprint cycle.
                </p>
            </div>
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-4">
               {(insights || []).slice(0, 3).map((ins, i) => (
                  <div key={i} className="glass-card-hover p-5 rounded-2xl flex flex-col gap-3 group relative overflow-hidden glow-border">
                      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                           <span className="text-8xl font-black font-headline">0{i+1}</span>
                      </div>
                      <span className="text-primary text-2xl font-black drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]">0{i+1}</span>
                      <p className="font-medium text-sm text-slate-200 relative z-10 leading-relaxed font-label">{ins}</p>
                  </div>
               ))}
            </div>
          </div>
        </div>

        {/* Matrix Dataset Table */}
        <div className="col-span-12 glass-card rounded-3xl p-8 glow-border">
          <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold font-headline text-slate-200">Raw Parameter Matrix</h3>
              <button className="text-xs bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-slate-300 border border-white/10 transition-all focus:outline-none">Export JSON</button>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left font-label border-separate border-spacing-y-2">
              <thead>
                <tr className="text-slate-500 text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-3 font-bold border-b border-white/5">Parameter Node</th>
                  <th className="px-6 py-3 font-bold border-b border-white/5">Local Value</th>
                  <th className="px-6 py-3 font-bold border-b border-white/5">Global Avg</th>
                  <th className="px-6 py-3 font-bold border-b border-white/5 w-64">Trajectory Target</th>
                  <th className="px-6 py-3 font-bold border-b border-white/5 text-right">Trend Velocity</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(breakdown || []).map(row => (
                  <tr key={row.parameter} className="group hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 rounded-l-xl font-bold text-slate-300">{row.parameter}</td>
                    <td className="px-6 py-4"><span className="font-mono font-bold text-primary px-2 py-1 bg-primary/10 rounded-md border border-primary/20">{row.yourScore}</span></td>
                    <td className="px-6 py-4 text-slate-400 font-mono">{row.avgMarket}</td>
                    <td className="px-6 py-4">
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div className={`h-full ${row.yourScore >= row.targetPath ? 'bg-secondary shadow-[0_0_8px_rgba(74,225,118,0.6)]' : 'bg-primary shadow-[0_0_8px_rgba(129,140,248,0.6)]'} rounded-full`} style={{ width:`${Math.min(row.yourScore / row.targetPath * 100, 100)}%` }}></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 rounded-r-xl text-right">
                      <span className={`font-bold flex items-center justify-end gap-1 ${row.trend === 'up' ? 'text-secondary' : 'text-error'}`}>
                        <span className="material-symbols-outlined text-[10px]">{row.trend === 'up' ? 'north_east' : 'south_east'}</span>
                        {Math.abs(row.delta)}%
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
