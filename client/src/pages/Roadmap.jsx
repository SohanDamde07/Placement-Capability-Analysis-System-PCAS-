import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useTheme } from '../context/ThemeContext';
import RoadmapDark from './dark-mode-ui/RoadmapDark';

const CATEGORY_ICONS = {
  'Coding Practice': 'code',
  'Projects':        'folder_special',
  'Internships':     'work',
  'Communication':   'record_voice_over',
  'Interview Prep':  'psychology',
};
const CATEGORY_COLORS = {
  'Coding Practice': 'text-primary bg-indigo-50',
  'Projects':        'text-secondary bg-green-50',
  'Internships':     'text-error bg-red-50',
  'Communication':   'text-tertiary bg-orange-50',
  'Interview Prep':  'text-primary bg-purple-50',
};

export default function Roadmap() {
  const { theme } = useTheme();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Tasks');

  const load = () => {
    api.get('/api/roadmap').then(r => { setRoadmap(r.data.roadmap); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const r = await api.post('/api/roadmap/generate');
      setRoadmap(r.data.roadmap);
    } catch { alert('Could not generate roadmap. Complete your Skill Profile first.'); }
    finally { setGenerating(false); }
  };

  const toggleTask = async (taskId) => {
    try {
      const r = await api.patch(`/api/roadmap/task/${taskId}`);
      setRoadmap(r.data.roadmap);
    } catch {}
  };

  const categories = ['All Tasks', ...new Set(roadmap?.tasks?.map(t => t.category) || [])];
  const filtered = activeFilter === 'All Tasks'
    ? (roadmap?.tasks || [])
    : (roadmap?.tasks || []).filter(t => t.category === activeFilter);

  if (theme === 'dark') {
    return <RoadmapDark roadmap={roadmap} loading={loading} generating={generating} activeFilter={activeFilter} setActiveFilter={setActiveFilter} generate={generate} toggleTask={toggleTask} categories={categories} filtered={filtered} />;
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="grid grid-cols-12 gap-8 items-end">
        <div className="col-span-12 lg:col-span-7">
          <span className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-3 block">Personalized Learning Path</span>
          <h2 className="text-5xl font-black font-headline text-on-surface leading-[1.1] mb-4">Action<br />Roadmap</h2>
          <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed">
            Curated tasks based on your skill gaps to optimize your career milestone.
          </p>
        </div>
        <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline font-bold text-xl">Overall Progress</h3>
            <span className="text-3xl font-black text-primary">{roadmap?.overallProgress || 0}%</span>
          </div>
          <div className="h-4 w-full bg-surface-container rounded-full overflow-hidden mb-5">
            <div className="h-full rounded-full transition-all duration-700" style={{ width:`${roadmap?.overallProgress || 0}%`, background:'linear-gradient(90deg,#3525cd,#4f46e5)' }}></div>
          </div>
          <div className="flex gap-3">
            <div className="px-3 py-2 bg-secondary-container/30 rounded-xl">
              <span className="text-[10px] block font-bold text-on-secondary-container uppercase">Tasks Done</span>
              <span className="text-lg font-bold">{roadmap?.tasks?.filter(t=>t.status==='completed').length || 0}/{roadmap?.tasks?.length || 0}</span>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Generate button */}
      {(!roadmap || !roadmap.tasks?.length) ? (
        <div className="flex flex-col items-center justify-center h-48 gap-4 bg-surface-container-lowest rounded-3xl">
          <span className="material-symbols-outlined text-4xl text-outline">alt_route</span>
          <p className="text-on-surface-variant">No roadmap yet.</p>
          <button onClick={generate} disabled={generating}
            className="px-8 py-3 rounded-xl text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-60"
            style={{ background:'linear-gradient(135deg,#3525cd,#4f46e5)' }}>
            {generating ? 'Generating…' : 'Generate My Roadmap'}
          </button>
        </div>
      ) : (
        <>
          {/* Category tabs */}
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveFilter(cat)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                  activeFilter === cat
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                }`}>
                {cat}
              </button>
            ))}
            <button onClick={generate} disabled={generating}
              className="ml-auto px-4 py-2.5 rounded-full font-bold text-xs bg-surface-container text-on-surface-variant hover:bg-surface-container-high whitespace-nowrap">
              ↻ Regenerate
            </button>
          </div>

          {/* Task list grouped by category */}
          <div className="space-y-10 relative">
            <div className="absolute left-[39px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-outline-variant/30 to-transparent"></div>
            {(activeFilter === 'All Tasks' ? Object.keys(CATEGORY_ICONS) : [activeFilter])
              .filter(cat => filtered.some(t => t.category === cat))
              .map(cat => {
                const tasks = filtered.filter(t => t.category === cat);
                if (!tasks.length) return null;
                const iconClass = CATEGORY_COLORS[cat] || 'text-primary bg-indigo-50';
                return (
                  <div key={cat} className="relative pl-24 group">
                    <div className="absolute left-0 top-0 w-20 h-20 bg-surface-container-lowest rounded-3xl flex items-center justify-center shadow-sm z-10 outline outline-4 outline-surface">
                      <span className={`material-symbols-outlined text-3xl ${iconClass.split(' ')[0]}`} style={{ fontVariationSettings:"'FILL' 1" }}>
                        {CATEGORY_ICONS[cat]}
                      </span>
                    </div>
                    <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-transparent hover:border-primary/10 transition-all">
                      <div className="flex justify-between items-start mb-5">
                        <div>
                          <span className={`px-3 py-1 ${iconClass} rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block`}>
                            {cat}
                          </span>
                          <h4 className="text-xl font-headline font-extrabold">{cat}</h4>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {tasks.map(task => (
                          <label key={task._id} onClick={() => toggleTask(task._id)}
                            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container-low transition-colors cursor-pointer">
                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                              task.status === 'completed' ? 'bg-secondary border-secondary' : 'border-primary/30 hover:border-primary'
                            }`}>
                              {task.status === 'completed' && (
                                <span className="material-symbols-outlined text-white text-xs">check</span>
                              )}
                            </div>
                            <span className={`flex-1 font-medium text-sm ${task.status === 'completed' ? 'line-through opacity-50' : 'text-on-surface'}`}>
                              {task.title}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              task.priority === 'High' ? 'bg-primary/10 text-primary' :
                              task.priority === 'Medium' ? 'bg-surface-container text-on-surface-variant' :
                              'bg-surface-container text-outline'
                            }`}>
                              {task.status === 'completed' ? 'Completed' : task.priority}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}
