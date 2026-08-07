import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SkillProfileDark from './dark-mode-ui/SkillProfileDark';

const SKILL_SUGGESTIONS = ['Python','JavaScript','React','Node.js','MongoDB','SQL','AWS','Docker','Machine Learning','C++','Java','Flutter','TypeScript','Git','Figma'];
const BRANCHES = ['CSE','ECE','EEE','ME','CE','IT','AI/ML','Data Science','Other'];

export default function SkillProfile() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [uploadMsg, setUploadMsg] = useState('');
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '',
    branch: user?.branch || 'CSE', year: user?.year || 1,
    skills: [], projectCount: 1, projectLevel: 1,
    internshipCount: 0, internshipDetails: '',
    commScore: 5, cgpa: 7.0,
  });

  useEffect(() => {
    api.get('/api/profile').then(r => {
      if (r.data.profile) {
        const p = r.data.profile;
        setForm(f => ({
          ...f,
          name: p.name || f.name, email: p.email || f.email,
          branch: p.branch || f.branch, year: p.year || f.year,
          skills: p.skills || [], projectCount: p.projectCount || 1,
          projectLevel: p.projectLevel || 1, internshipCount: p.internshipCount || 0,
          internshipDetails: p.internshipDetails || '',
          commScore: p.commScore || 5, cgpa: p.cgpa || 7.0,
        }));
      }
    }).catch(() => {});
  }, []);

  const addSkill = (s) => {
    const sk = s.trim();
    if (sk && !form.skills.includes(sk)) setForm(f => ({ ...f, skills: [...f.skills, sk] }));
    setSkillInput('');
  };

  const removeSkill = (s) => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }));

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadMsg('');
    const fd = new FormData();
    fd.append('resume', file);
    try {
      const r = await api.post('/api/profile/resume', fd, { headers:{ 'Content-Type':'multipart/form-data' }, timeout: 90000 });
      const extracted = r.data.extractedSkills || [];
      const ai = r.data.aiAnalysis;

      if (ai && extracted.length > 0) {
        // Success — auto-fill form
        const merged = [...new Set([...form.skills, ...extracted])];
        const updates = { skills: merged };
        if (ai.projectCount > (form.projectCount || 0)) updates.projectCount = ai.projectCount;
        if (ai.internshipExperience && form.internshipCount === 0) updates.internshipCount = 1;
        setForm(f => ({ ...f, ...updates }));

        const parts = [`✅ AI analyzed your resume — ${extracted.length} skills extracted`];
        if (ai.suggestedRole) parts.push(`Role: ${ai.suggestedRole}`);
        if (r.data.prsScore != null) parts.push(`PRS: ${r.data.prsScore}`);
        setUploadMsg(parts.join(' • '));
      } else {
        // Analysis failed or returned empty — show backend message
        setUploadMsg(r.data.message || '⚠️ Could not analyze resume. Please enter your data manually.');
      }
    } catch (err) {
      setUploadMsg(err.response?.data?.message || '⚠️ Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };


  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.post('/api/analyze', form);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to analyze profile');
    } finally {
      setSaving(false);
    }
  };

  const steps = ['Personal Details','Skills','Projects','Internships'];
  const progress = Math.round(((step + 1) / steps.length) * 100);

  if (theme === 'dark') {
    return <SkillProfileDark 
        step={step} setStep={setStep} saving={saving} uploading={uploading} 
        skillInput={skillInput} setSkillInput={setSkillInput} uploadMsg={uploadMsg} 
        form={form} setForm={setForm} addSkill={addSkill} removeSkill={removeSkill} 
        fileRef={fileRef} handleUpload={handleUpload} handleSubmit={handleSubmit} 
        steps={steps} progress={progress} SKILL_SUGGESTIONS={SKILL_SUGGESTIONS} 
        BRANCHES={BRANCHES} 
    />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center pb-16">
      {/* Progress */}
      <div className="w-full max-w-4xl mb-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-headline font-bold text-on-surface">Build your intelligence layer.</h1>
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-primary">{progress}% Completed</span>
            <div className="w-48 h-1.5 bg-surface-container-high rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width:`${progress}%` }}></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-col gap-1">
              <div className={`h-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-surface-container-high'}`}></div>
              <span className={`text-[10px] uppercase tracking-wider font-bold ${i <= step ? 'text-primary' : 'text-outline'}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left column */}
        <div className="md:col-span-7 space-y-6">

          {/* Step 0: Personal */}
          {step === 0 && (
            <section className="p-8 rounded-3xl bg-surface-container-lowest shadow-sm space-y-4">
              <h2 className="text-xl font-headline font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span> Personal Details
              </h2>
              {[
                { id:'name', label:'Full Name', type:'text', ph:'Rahul Sharma' },
                { id:'email', label:'Email', type:'email', ph:'name@college.edu' },
                { id:'cgpa', label:'CGPA (out of 10)', type:'number', ph:'8.5', step:0.1, min:0, max:10 },
              ].map(({ id, label, type, ph, ...rest }) => (
                <div key={id}>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">{label}</label>
                  <input
                    type={type} placeholder={ph} {...rest}
                    className="w-full py-3 px-4 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={form[id]} onChange={e => setForm(f => ({ ...f, [id]: type === 'number' ? parseFloat(e.target.value) : e.target.value }))}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Branch</label>
                  <select className="w-full py-3 px-4 bg-surface-container-low border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}>
                    {BRANCHES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Year</label>
                  <select className="w-full py-3 px-4 bg-surface-container-low border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))}>
                    {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* Step 1: Skills */}
          {step === 1 && (
            <section className="p-8 rounded-3xl bg-surface-container-lowest shadow-sm">
              <h2 className="text-xl font-headline font-bold flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-primary">psychology</span> Technical Expertise
              </h2>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Add skills that define your profile</label>
              <div className="flex flex-wrap gap-2 p-3 min-h-[56px] border-b-2 border-outline-variant/30 focus-within:border-primary transition-all mb-3 bg-surface-container-low rounded-t-xl">
                {form.skills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {s}
                    <button onClick={() => removeSkill(s)} className="material-symbols-outlined text-xs cursor-pointer hover:text-error">close</button>
                  </span>
                ))}
                <input
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none min-w-[120px]"
                  placeholder="Type skill & press Enter…"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(skillInput); } }}
                />
              </div>
              <div className="flex gap-2 flex-wrap mb-2">
                {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).slice(0, 8).map(s => (
                  <button key={s} onClick={() => addSkill(s)}
                    className="px-3 py-1 rounded-full bg-surface-container text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors">
                    + {s}
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-outline-variant/10">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface">Communication Clarity</label>
                    <p className="text-xs text-on-surface-variant">How would you rate your communication skills?</p>
                  </div>
                  <span className="text-2xl font-headline font-bold text-primary">{form.commScore}<span className="text-sm text-outline">/10</span></span>
                </div>
                <input type="range" min="1" max="10" className="w-full accent-primary"
                  value={form.commScore} onChange={e => setForm(f => ({ ...f, commScore: parseInt(e.target.value) }))} />
                <div className="flex justify-between text-[10px] text-outline font-bold mt-1 uppercase">
                  <span>Developing</span><span>Expert</span>
                </div>
              </div>
            </section>
          )}

          {/* Step 2: Projects */}
          {step === 2 && (
            <section className="p-8 rounded-3xl bg-surface-container-lowest shadow-sm space-y-5">
              <h2 className="text-xl font-headline font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">folder_special</span> Projects
              </h2>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Number of Projects</label>
                <input type="number" min="0" max="20"
                  className="w-full py-3 px-4 bg-surface-container-low border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  value={form.projectCount} onChange={e => setForm(f => ({ ...f, projectCount: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">Project Complexity Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {[['Beginner',1],['Intermediate',2],['Advanced',3]].map(([label, val]) => (
                    <button key={val} onClick={() => setForm(f => ({ ...f, projectLevel: val }))}
                      className={`py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                        form.projectLevel === val
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                          : 'bg-surface-container border-outline-variant/20 text-on-surface hover:border-primary/30'
                      }`}>{label}</button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Step 3: Internships */}
          {step === 3 && (
            <section className="p-8 rounded-3xl bg-surface-container-lowest shadow-sm space-y-5">
              <h2 className="text-xl font-headline font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">work</span> Internships
              </h2>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Number of Internships</label>
                <input type="number" min="0" max="10"
                  className="w-full py-3 px-4 bg-surface-container-low border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  value={form.internshipCount} onChange={e => setForm(f => ({ ...f, internshipCount: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Details (company, role, duration)</label>
                <textarea rows={4} placeholder="e.g. Infosys summer intern, Jan 2024 – Mar 2024, Backend Developer"
                  className="w-full py-3 px-4 bg-surface-container-low border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  value={form.internshipDetails} onChange={e => setForm(f => ({ ...f, internshipDetails: e.target.value }))} />
              </div>
            </section>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
              className="flex items-center gap-2 text-on-surface-variant font-bold hover:text-on-surface transition-colors disabled:opacity-30">
              <span className="material-symbols-outlined">arrow_back</span> Back
            </button>
            <div className="flex gap-3">
              {step < steps.length - 1 ? (
                <button onClick={() => setStep(s => s + 1)}
                  className="px-8 py-3 rounded-xl text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  style={{ background:'linear-gradient(135deg,#3525cd,#4f46e5)' }}>
                  Continue
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={saving}
                  className="px-10 py-3 rounded-xl text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70"
                  style={{ background:'linear-gradient(135deg,#3525cd,#4f46e5)' }}>
                  {saving ? 'Analyzing…' : 'Save & Analyze'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right column: resume upload + AI card */}
        <div className="md:col-span-5 space-y-6">
          <div
            className="relative group p-8 rounded-3xl bg-surface-container-low border-2 border-dashed border-outline-variant/50 hover:border-primary/50 transition-all flex flex-col items-center text-center min-h-[220px] cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-primary">{uploading ? 'hourglass_empty' : 'upload_file'}</span>
            </div>
            <h3 className="text-lg font-headline font-bold text-on-surface">Upload your Resume</h3>
            <p className="text-sm text-on-surface-variant mt-2 px-4">
              Our AI will automatically parse your experience and extract skills.
            </p>
            <button className="mt-6 px-6 py-2 bg-surface-container-lowest text-primary font-bold rounded-xl shadow-sm hover:shadow-md transition-all text-sm">
              {uploading ? 'Analyzing…' : 'Browse Files'}
            </button>
            <p className="text-[10px] text-outline mt-3 uppercase font-bold tracking-widest">PDF, DOCX (Max 10MB)</p>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden"
              onChange={e => handleUpload(e.target.files[0])} />
          </div>
          {uploadMsg && (
            <div className="p-3 rounded-xl bg-surface-container text-sm font-medium text-on-surface">{uploadMsg}</div>
          )}

          {/* AI Suggestion Card */}
          <div className="p-6 rounded-3xl bg-primary text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">AI Suggestion</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">
                {form.skills.length > 0
                  ? `You have ${form.skills.length} skills listed. Skills like Python and React often see a 40% higher match rate for tech internships.`
                  : 'Add technical skills to your profile to unlock AI-powered placement insights.'}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
                {form.skills.length > 5 ? 'Strong Profile' : 'Keep Building'}
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="material-symbols-outlined text-[120px]">psychology</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
