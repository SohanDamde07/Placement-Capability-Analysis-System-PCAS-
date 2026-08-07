import React from 'react';

const CATEGORY_ICONS = {
  'Coding Practice': 'code',
  'Projects':        'folder_special',
  'Internships':     'work',
  'Communication':   'record_voice_over',
  'Interview Prep':  'psychology',
};

const CATEGORY_CLASSES = {
  'Coding Practice': { text: 'text-primary', bg: 'bg-primary/20', border: 'border-primary/30', shadow: 'shadow-[0_0_15px_rgba(129,140,248,0.3)]' },
  'Projects':        { text: 'text-secondary', bg: 'bg-secondary/20', border: 'border-secondary/30', shadow: 'shadow-[0_0_15px_rgba(74,225,118,0.3)]' },
  'Internships':     { text: 'text-error', bg: 'bg-error/20', border: 'border-error/30', shadow: 'shadow-[0_0_15px_rgba(255,180,171,0.3)]' },
  'Communication':   { text: 'text-tertiary', bg: 'bg-tertiary/20', border: 'border-tertiary/30', shadow: 'shadow-[0_0_15px_rgba(255,185,95,0.3)]' },
  'Interview Prep':  { text: 'text-primary-fixed', bg: 'bg-primary-fixed/20', border: 'border-primary-fixed/30', shadow: 'shadow-[0_0_15px_rgba(195,192,255,0.3)]' },
};

export default function RoadmapDark({ roadmap, loading, generating, activeFilter, setActiveFilter, generate, toggleTask, categories, filtered }) {
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <section className="grid grid-cols-12 gap-8 items-end relative z-10">
        <div className="col-span-12 lg:col-span-7">
          <span className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-3 block glow-text">Sequential Execution Path</span>
          <h2 className="text-5xl font-black font-headline text-slate-100 leading-[1.1] mb-4">Strategic<br />Roadmap</h2>
          <p className="text-lg text-slate-400 max-w-lg leading-relaxed font-label">
            Algorithmic task curation tailored to optimize your milestone trajectory and eliminate skill gaps.
          </p>
        </div>
        <div className="col-span-12 lg:col-span-5 glass-card-accent p-8 rounded-[2rem] glow-border relative overflow-hidden group hover:bg-primary/20 transition-all duration-700">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/20 transition-all"></div>
          <div className="flex justify-between items-center mb-4 relative z-10">
            <h3 className="font-headline font-bold text-xl text-slate-200">Terminal Progress</h3>
            <span className="text-3xl font-black text-primary drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]">{roadmap?.overallProgress || 0}%</span>
          </div>
          <div className="h-2 w-full bg-surface/50 rounded-full overflow-hidden mb-6 border border-white/5 relative z-10">
            <div className="h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(129,140,248,0.6)] bg-primary" 
                 style={{ width:`${roadmap?.overallProgress || 0}%` }}></div>
          </div>
          <div className="flex gap-3 relative z-10">
            <div className="px-4 py-2 glass-input rounded-xl border border-white/10">
              <span className="text-[10px] block font-bold text-slate-400 uppercase tracking-widest">Tasks Committed</span>
              <span className="text-lg font-bold text-slate-200">{roadmap?.tasks?.filter(t=>t.status==='completed').length || 0}/{roadmap?.tasks?.length || 0}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Logic Container */}
      {(!roadmap || !roadmap.tasks?.length) ? (
        <div className="flex flex-col items-center justify-center h-64 gap-6 glass-card rounded-3xl glow-border">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 glow-border ai-float-glow">
              <span className="material-symbols-outlined text-4xl text-slate-400">route</span>
          </div>
          <p className="text-slate-400 font-label">Your strategic roadmap is not initialized.</p>
          <button onClick={generate} disabled={generating}
            className="px-10 py-4 check-btn rounded-2xl bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 hover:border-white/30 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(129,140,248,0.15)] flex gap-2 items-center">
            {generating ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">memory</span>}
            {generating ? 'Compiling Path...' : 'Initialize Roadmap'}
          </button>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar mt-4 relative z-10">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveFilter(cat)}
                className={`px-6 py-3 rounded-full font-bold text-sm whitespace-nowrap transition-all border ${
                  activeFilter === cat
                    ? 'bg-primary/20 text-primary border-primary/40 shadow-[0_0_15px_rgba(129,140,248,0.3)] backdrop-blur-md'
                    : 'glass-input text-slate-400 hover:text-slate-200 border-white/5 hover:border-white/10'
                }`}>
                {cat}
              </button>
            ))}
            <button onClick={generate} disabled={generating}
              className="ml-auto px-6 py-3 rounded-full font-bold text-xs bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:bg-white/10 whitespace-nowrap transition-all flex items-center gap-2">
              <span className={`material-symbols-outlined text-sm ${generating ? 'animate-spin' : ''}`}>sync</span> 
              Re-evaluate
            </button>
          </div>

          {/* Timeline View */}
          <div className="space-y-12 relative z-10 mt-8 pt-4">
            <div className="absolute left-[47px] top-4 bottom-0 w-px bg-gradient-to-b from-primary via-white/10 to-transparent"></div>
            
            {(activeFilter === 'All Tasks' ? Object.keys(CATEGORY_ICONS) : [activeFilter])
              .filter(cat => filtered.some(t => t.category === cat))
              .map(cat => {
                const tasks = filtered.filter(t => t.category === cat);
                if (!tasks.length) return null;
                const styleDef = CATEGORY_CLASSES[cat] || CATEGORY_CLASSES['Coding Practice'];
                
                return (
                  <div key={cat} className="relative pl-[110px] group">
                    {/* Glowing Node Icon */}
                    <div className={`absolute left-4 top-2 w-16 h-16 rounded-2xl flex items-center justify-center border backdrop-blur-xl z-10 ${styleDef.bg} ${styleDef.border} ${styleDef.text} ${styleDef.shadow}`}>
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings:"'FILL' 1" }}>
                        {CATEGORY_ICONS[cat]}
                      </span>
                    </div>
                    
                    {/* Category Block */}
                    <div className="glass-card p-8 rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all glow-border">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="text-2xl font-headline font-extrabold text-slate-200 tracking-tight">{cat}</h4>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {tasks.map(task => (
                          <label key={task._id} onClick={(e) => { e.preventDefault(); toggleTask(task._id); }}
                            className="flex items-center gap-5 p-5 glass-input rounded-2xl hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group/item">
                            
                            {/* Custom Checkbox */}
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              task.status === 'completed' 
                                ? `bg-secondary border-secondary shadow-[0_0_10px_rgba(74,225,118,0.5)]` 
                                : `border-slate-500/50 group-hover/item:border-primary/50 group-hover/item:shadow-[0_0_10px_rgba(129,140,248,0.3)]`
                            }`}>
                              {task.status === 'completed' && (
                                <span className="material-symbols-outlined text-white text-sm font-bold">check</span>
                              )}
                            </div>
                            
                            {/* Task Info */}
                            <span className={`flex-1 font-medium text-[15px] font-label transition-all ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                              {task.title}
                            </span>
                            
                            {/* Priority Tag */}
                            <span className={`text-[10px] font-bold px-3 py-1 bg-surface-container rounded-md uppercase tracking-widest border border-white/5 ${
                              task.priority === 'High' ? 'text-primary' :
                              task.priority === 'Medium' ? 'text-slate-400' :
                              'text-slate-500'
                            }`}>
                              {task.status === 'completed' ? 'Done' : task.priority}
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
