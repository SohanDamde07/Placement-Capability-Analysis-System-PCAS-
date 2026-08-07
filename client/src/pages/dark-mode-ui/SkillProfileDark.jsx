import React from 'react';

export default function SkillProfileDark({
  step, setStep, saving, uploading, skillInput, setSkillInput, uploadMsg, form, setForm,
  addSkill, removeSkill, fileRef, handleUpload, handleSubmit, steps, progress,
  SKILL_SUGGESTIONS, BRANCHES
}) {

  return (
    <div className="flex flex-col items-center pb-16 animate-in fade-in duration-500 text-on-surface">
      {/* Progress System */}
      <div className="w-full max-w-4xl mb-12">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-headline font-bold leading-tight">Build your intelligence layer.</h1>
          <div className="flex flex-col items-end">
            <span className="text-sm font-label font-bold text-primary">{progress}% Completed</span>
            <div className="w-48 h-1.5 bg-surface-container-high/40 rounded-full mt-2 overflow-hidden backdrop-blur-sm">
              <div className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(195,192,255,0.6)] transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-col gap-2">
              <div className={`h-1 rounded-full ${i <= step ? 'bg-primary shadow-[0_0_8px_rgba(195,192,255,0.4)]' : 'bg-surface-container-high/30'}`}></div>
              <span className={`text-[10px] uppercase tracking-wider font-bold ${i <= step ? 'text-primary' : 'text-outline-variant/50'}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Onboarding Card */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
        
        {/* Decorative background blur */}
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        {/* Left Column: Core Inputs */}
        <div className="md:col-span-7 space-y-8">
          
          {/* Step 0: Personal */}
          {step === 0 && (
            <section className="p-8 rounded-3xl glass-card glass-card-hover text-on-surface space-y-6 glow-border">
              <h2 className="text-xl font-headline font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" data-weight="fill">person</span> Personal Details
              </h2>
              {[
                { id:'name', label:'Full Name', type:'text', ph:'Rahul Sharma' },
                { id:'email', label:'Email', type:'email', ph:'name@college.edu' },
                { id:'cgpa', label:'CGPA (out of 10)', type:'number', ph:'8.5', step:0.1, min:0, max:10 },
              ].map(({ id, label, type, ph, ...rest }) => (
                <div key={id}>
                  <label className="block text-sm font-label text-on-surface-variant font-medium mb-2">{label}</label>
                  <input
                    type={type} placeholder={ph} {...rest}
                    className="w-full py-3 px-4 glass-input border-none rounded-xl text-sm focus:ring-1 focus:ring-primary/40 outline-none text-slate-200 placeholder:text-slate-500 transition-all glow-border focus:shadow-[0_0_15px_rgba(129,140,248,0.2)]"
                    value={form[id]} onChange={e => setForm(f => ({ ...f, [id]: type === 'number' ? parseFloat(e.target.value) : e.target.value }))}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-label text-on-surface-variant font-medium mb-2">Branch</label>
                  <select className="w-full py-3 px-4 glass-input border-none rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary/40 text-slate-200 glow-border [&>option]:bg-surface-container"
                    value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}>
                    {BRANCHES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-label text-on-surface-variant font-medium mb-2">Year</label>
                  <select className="w-full py-3 px-4 glass-input border-none rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary/40 text-slate-200 glow-border [&>option]:bg-surface-container"
                    value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))}>
                    {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* Step 1: Skills */}
          {step === 1 && (
            <React.Fragment>
              <section className="p-8 rounded-3xl glass-card glass-card-hover text-on-surface glow-border">
                <h2 className="text-xl font-headline font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" data-weight="fill">psychology</span>
                  Technical Expertise
                </h2>
                <div className="space-y-4">
                  <label className="block text-sm font-label text-on-surface-variant font-medium">Add skills that define your profile</label>
                  <div className="flex flex-wrap gap-2 p-4 min-h-[64px] glass-input rounded-2xl glow-border focus-within:border-primary/50 transition-all">
                    {form.skills.map(s => (
                      <span key={s} className="inline-flex items-center gap-1 bg-primary/20 text-primary-fixed-dim px-3 py-1 rounded-full text-sm font-medium border border-primary/30 backdrop-blur-md">
                        {s} <span onClick={() => removeSkill(s)} className="material-symbols-outlined text-xs cursor-pointer hover:text-white">close</span>
                      </span>
                    ))}
                    <input
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0 min-w-[120px] text-slate-200 placeholder:text-outline-variant outline-none"
                      placeholder="Type a skill..."
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(skillInput); } }}
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).slice(0, 5).map(s => (
                      <button key={s} onClick={() => addSkill(s)} className="whitespace-nowrap px-4 py-1.5 rounded-full glass-input text-xs font-label text-on-surface hover:bg-primary/20 hover:border-primary/40 transition-all shadow-sm">
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
              <section className="p-8 rounded-3xl glass-card glass-card-hover text-on-surface glow-border">
                <h2 className="text-xl font-headline font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" data-weight="fill">chat</span>
                  Soft Skills & Intelligence
                </h2>
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <label className="block text-sm font-label font-semibold">Communication Clarity</label>
                      <p className="text-xs text-on-surface-variant">How would you rate your ability to explain complex concepts?</p>
                    </div>
                    <span className="text-2xl font-headline font-bold text-primary drop-shadow-[0_0_10px_rgba(195,192,255,0.4)]">
                        {form.commScore}<span className="text-sm text-outline-variant/60">/10</span>
                    </span>
                  </div>
                  <div className="relative pt-1 px-1">
                    <input className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer backdrop-blur-sm accent-primary focus:outline-none" max="10" min="1" type="range" 
                        value={form.commScore} onChange={e => setForm(f => ({ ...f, commScore: parseInt(e.target.value) }))}
                    />
                    <div className="flex justify-between text-[10px] text-outline-variant font-bold mt-4 uppercase tracking-widest opacity-60">
                      <span>Developing</span>
                      <span>Expert</span>
                    </div>
                  </div>
                </div>
              </section>
            </React.Fragment>
          )}

          {/* Step 2: Projects */}
          {step === 2 && (
            <section className="p-8 rounded-3xl glass-card glass-card-hover text-on-surface space-y-6 glow-border">
              <h2 className="text-xl font-headline font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" data-weight="fill">folder_special</span> Projects
              </h2>
              <div>
                <label className="block text-sm font-label text-on-surface-variant font-medium mb-2">Number of Projects</label>
                <input type="number" min="0" max="20"
                  className="w-full py-3 px-4 glass-input border-none rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary/40 text-slate-200 glow-border"
                  value={form.projectCount} onChange={e => setForm(f => ({ ...f, projectCount: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="block text-sm font-label text-on-surface-variant font-medium mb-3">Project Complexity Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {[['Beginner',1],['Intermediate',2],['Advanced',3]].map(([label, val]) => (
                    <button key={val} onClick={() => setForm(f => ({ ...f, projectLevel: val }))}
                      className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                        form.projectLevel === val
                          ? 'bg-primary/20 text-primary border-primary/50 shadow-[0_0_15px_rgba(129,140,248,0.3)]'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:border-primary/30 hover:text-slate-200'
                      }`}>{label}</button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Step 3: Internships */}
          {step === 3 && (
            <section className="p-8 rounded-3xl glass-card glass-card-hover text-on-surface space-y-6 glow-border">
              <h2 className="text-xl font-headline font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" data-weight="fill">work</span> Internships
              </h2>
              <div>
                <label className="block text-sm font-label text-on-surface-variant font-medium mb-2">Number of Internships</label>
                <input type="number" min="0" max="10"
                  className="w-full py-3 px-4 glass-input border-none rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary/40 text-slate-200 glow-border"
                  value={form.internshipCount} onChange={e => setForm(f => ({ ...f, internshipCount: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="block text-sm font-label text-on-surface-variant font-medium mb-2">Details (company, role, duration)</label>
                <textarea rows={4} placeholder="e.g. Infosys summer intern, Jan 2024 – Mar 2024, Backend Developer"
                  className="w-full py-3 px-4 glass-input border-none rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary/40 text-slate-200 resize-none glow-border placeholder:text-outline-variant"
                  value={form.internshipDetails} onChange={e => setForm(f => ({ ...f, internshipDetails: e.target.value }))} />
              </div>
            </section>
          )}

        </div>

        {/* Right Column: Upload & Context */}
        <div className="md:col-span-5 space-y-8">
          {/* Resume Upload Zone */}
          <div className="relative group p-8 rounded-3xl glass-card border flex flex-col items-center justify-center text-center min-h-[320px] glow-border transition-all hover:bg-white/5 cursor-pointer"
             onClick={() => fileRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-2xl glass-input flex items-center justify-center mb-6 shadow-xl border border-white/10 group-hover:border-primary/50 transition-colors">
              <span className="material-symbols-outlined text-3xl text-primary drop-shadow-[0_0_8px_rgba(195,192,255,0.5)]">
                  {uploading ? 'hourglass_empty' : 'upload_file'}
              </span>
            </div>
            <h3 className="text-lg font-headline font-bold text-on-surface">Upload your Resume</h3>
            <p className="text-sm text-on-surface-variant/80 mt-2 px-8">Our AI will automatically parse your experience and map it to your Skill Roadmap.</p>
            <button className="mt-8 px-8 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:bg-white/20 transition-all">
                {uploading ? 'Parsing NLP...' : 'Browse Files'}
            </button>
            <p className="text-[10px] text-outline-variant/60 mt-4 uppercase font-bold tracking-widest">PDF, DOCX (Max 10MB)</p>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={e => handleUpload(e.target.files[0])} />
          </div>
          
          {uploadMsg && (
            <div className="p-4 rounded-2xl glass-card border border-primary/20 text-sm font-medium text-primary bg-primary/5 shadow-[0_0_15px_rgba(129,140,248,0.1)]">
                {uploadMsg}
            </div>
          )}

          {/* AI Insight Card */}
          <div className="p-6 rounded-3xl bg-primary/10 backdrop-blur-xl text-primary-fixed shadow-[0_0_30px_rgba(79,70,229,0.15)] relative overflow-hidden border border-primary/30">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-sm text-primary">auto_awesome</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 text-primary">AI Suggestion</span>
              </div>
              <p className="text-sm font-medium leading-relaxed text-slate-200">
                {form.skills.length > 0
                  ? `You have ${form.skills.length} skills listed. Skills like React.js and Python often see a 40% higher match rate for AI integration internships.`
                  : 'Add technical skills to your profile to unlock predictive placement insights.'}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/10">
                {form.skills.length > 5 ? 'High Demand Profile' : 'Keep Adding'}
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <span className="material-symbols-outlined text-[120px]">psychology</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="w-full max-w-5xl mt-12 flex items-center justify-between relative z-10">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="flex items-center gap-2 text-on-surface-variant font-bold hover:text-white transition-colors disabled:opacity-30">
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>
        <div className="flex items-center gap-4">
          <button className="px-8 py-3 rounded-2xl glass-input text-on-surface-variant font-bold hover:bg-white/10 hover:text-white transition-all text-sm">
              Skip for now
          </button>
          
          {step < steps.length - 1 ? (
              <button 
                onClick={() => setStep(s => s + 1)}
                className="px-10 py-3 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-white font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all outline-none"
              >
                  Continue
              </button>
          ) : (
             <button 
                onClick={handleSubmit} disabled={saving}
                className="px-10 py-3 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-white font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:hover:scale-100 outline-none"
             >
                 {saving ? 'Analyzing…' : 'Save & Analyze'}
             </button>
          )}
        </div>
      </div>
    </div>
  );
}
