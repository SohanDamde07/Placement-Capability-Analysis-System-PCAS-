import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface-variant text-sm font-medium">Loading placement analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-error-container text-on-error-container rounded-2xl max-w-xl mx-auto my-12">
        <h3 className="font-bold text-lg mb-1">Access Restricted</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const {
    totalUsers = 0,
    totalAnalyzed = 0,
    pendingAnalysis = 0,
    avgPrs = 0,
    placementReady = 0,
    intermediate = 0,
    beginner = 0,
    branchPerformance = [],
    yearDistribution = {},
    topSkills = [],
    mlStatus = {},
  } = stats || {};

  const completionRate = totalUsers > 0 ? Math.round((totalAnalyzed / totalUsers) * 100) : 0;
  const readyPercent = totalAnalyzed > 0 ? Math.round((placementReady / totalAnalyzed) * 100) : 0;
  const interPercent = totalAnalyzed > 0 ? Math.round((intermediate / totalAnalyzed) * 100) : 0;
  const begPercent = totalAnalyzed > 0 ? Math.round((beginner / totalAnalyzed) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-primary p-6 md:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-72 h-72 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold tracking-wide uppercase mb-3 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            TPO & Administrative Console
          </div>
          <h1 className="text-3xl md:text-4xl font-black font-headline tracking-tight">Placement Capability Command Center</h1>
          <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
            Real-time batch intelligence, branch readiness benchmarks, and machine learning placement forecasts.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-xs font-bold backdrop-blur-sm border border-white/10"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh Live
          </button>
        </div>
      </div>

      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Students */}
        <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Registered Students</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-headline text-on-surface">{totalUsers}</span>
            <span className="text-xs text-on-surface-variant">Profiles</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-on-surface-variant border-t border-outline-variant/30 pt-3">
            <span>Analyzed: <strong className="text-primary font-bold">{totalAnalyzed}</strong></span>
            <span>Pending: <strong className="text-amber-600 font-bold">{pendingAnalysis}</strong></span>
          </div>
        </div>

        {/* Avg PRS Score */}
        <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Campus Avg PRS</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined">analytics</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-headline text-emerald-600">{avgPrs}</span>
            <span className="text-xs text-on-surface-variant">/ 100 max</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-on-surface-variant border-t border-outline-variant/30 pt-3">
            <span className="material-symbols-outlined text-emerald-500 text-sm">trending_up</span>
            <span>Batch Performance Index</span>
          </div>
        </div>

        {/* Placement Ready */}
        <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Drive-Ready Students</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined">verified</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-headline text-blue-600">{placementReady}</span>
            <span className="text-xs text-blue-600/80 font-bold">({readyPercent}%)</span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-on-surface-variant border-t border-outline-variant/30 pt-3">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>PRS &ge; 70.0 (Eligible for Day-1)</span>
          </div>
        </div>

        {/* ML Model Health */}
        <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Active ML Model</span>
            <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <span className="material-symbols-outlined">psychology</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-headline text-violet-700">80.85%</span>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Accuracy</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-on-surface-variant border-t border-outline-variant/30 pt-3">
            <span className="truncate">Pipeline: StandardScaler + LogReg</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online"></span>
          </div>
        </div>
      </div>

      {/* Main Analytical Section (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Readiness Table / Bars */}
        <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-headline text-on-surface">Department-Wise Capability Benchmarks</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Average PRS and participation volume across college branches</p>
            </div>
            <span className="material-symbols-outlined text-outline">bar_chart</span>
          </div>

          <div className="space-y-4">
            {branchPerformance.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-8 text-center">No branch analysis data recorded yet.</p>
            ) : (
              branchPerformance.map(bp => {
                const pct = Math.min(Math.max(bp.avgScore, 0), 100);
                const color = bp.avgScore >= 70 ? 'bg-emerald-500' : bp.avgScore >= 40 ? 'bg-primary' : 'bg-amber-500';
                return (
                  <div key={bp.branch} className="space-y-1.5 p-3 rounded-2xl hover:bg-surface-container/60 transition-colors">
                    <div className="flex items-center justify-between text-sm font-semibold text-on-surface">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center font-bold text-xs text-primary">
                          {bp.branch.slice(0, 3)}
                        </span>
                        <span>{bp.branch}</span>
                        <span className="text-xs font-normal text-on-surface-variant">({bp.studentCount} students)</span>
                      </div>
                      <span className="font-bold">{bp.avgScore} <span className="text-xs text-on-surface-variant">/ 100</span></span>
                    </div>
                    <div className="h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Readiness Tier Distribution Donut/Pill Card */}
        <div className="p-6 md:p-8 rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold font-headline text-on-surface">Readiness Tiers</h2>
              <span className="material-symbols-outlined text-outline">pie_chart</span>
            </div>
            <p className="text-xs text-on-surface-variant">Distribution across evaluated students</p>
          </div>

          {/* Visual Breakdown Stack */}
          <div className="space-y-4 my-2">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Placement Ready (&ge; 70)</p>
                <p className="text-2xl font-black text-emerald-700 font-headline">{placementReady} <span className="text-xs font-semibold">students</span></p>
              </div>
              <span className="text-xl font-black text-emerald-700">{readyPercent}%</span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Intermediate (40 – 69)</p>
                <p className="text-2xl font-black text-indigo-700 font-headline">{intermediate} <span className="text-xs font-semibold">students</span></p>
              </div>
              <span className="text-xl font-black text-indigo-700">{interPercent}%</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Beginner (&lt; 40)</p>
                <p className="text-2xl font-black text-amber-700 font-headline">{beginner} <span className="text-xs font-semibold">students</span></p>
              </div>
              <span className="text-xl font-black text-amber-700">{begPercent}%</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container text-xs text-on-surface-variant space-y-1">
            <span className="font-bold text-on-surface block">💡 TPO Recommendation:</span>
            Schedule intensive mock interviews and Aptitude bootcamps for the {beginner + intermediate} students currently below the placement threshold.
          </div>
        </div>
      </div>

      {/* Top In-Demand Skills & Year Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Declared Skills */}
        <div className="p-6 md:p-8 rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-headline text-on-surface">Top Skills in Student Profiles</h2>
            <span className="material-symbols-outlined text-outline">code</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {topSkills.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No skills recorded yet.</p>
            ) : (
              topSkills.map((sk, idx) => (
                <span
                  key={sk.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container text-on-surface text-xs font-semibold border border-outline-variant/30"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  {sk.name}
                  <span className="px-1.5 py-0.2 rounded-md bg-primary-container text-white text-[10px] font-bold">
                    {sk.count}
                  </span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Academic Year Representation */}
        <div className="p-6 md:p-8 rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-headline text-on-surface">Cohort Participation by Academic Year</h2>
            <span className="material-symbols-outlined text-outline">school</span>
          </div>
          <div className="grid grid-cols-4 gap-3 pt-2">
            {[1, 2, 3, 4].map(y => (
              <div key={y} className="p-4 rounded-2xl bg-surface-container text-center space-y-1">
                <span className="text-xs text-on-surface-variant font-medium">Year {y}</span>
                <p className="text-2xl font-black font-headline text-primary">{yearDistribution[y] || 0}</p>
                <span className="text-[10px] text-on-surface-variant block">Students</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
