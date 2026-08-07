import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const branches = ['CSE','ECE','EEE','ME','CE','IT','AI/ML','Data Science','Other'];

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', branch:'CSE', year:1 });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await register(form);
    if (result.success) navigate('/profile');
    else setError(result.message);
  };

  return (
    <div className="min-h-screen flex bg-surface overflow-hidden font-body">
      {/* Left brand panel */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #3525cd 60%, #4f46e5 100%)' }}></div>
        <div className="relative z-20 flex flex-col justify-between p-16 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-primary">psychology</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-white font-headline">PCAS</span>
          </div>
          <div className="max-w-md">
            <h1 className="text-5xl font-extrabold text-white leading-tight mb-6 font-headline">
              Start your <br /><span className="text-secondary-fixed">AI-powered journey.</span>
            </h1>
            <p className="text-indigo-200 text-lg leading-relaxed">
              Build your skill profile, get your Placement Readiness Score, and unlock a personalized roadmap.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[['.','ML-based PRS Score'],['.','Personalized Roadmap'],['.','Skill Gap Analysis'],['.','AI Assistant']].map(([i,t]) => (
              <div key={t} className="flex items-center gap-2 text-white text-sm font-medium">
                <span className="text-lg">{i}</span><span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right form panel */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-16 bg-surface overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-on-surface mb-2 font-headline">Create Account</h2>
            <p className="text-on-surface-variant">Build your intelligent placement profile.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm font-medium">{error}</div>
            )}
            {[
              { id:'name', label:'Full Name', type:'text', plh:'Rahul Sharma', icon:'person' },
              { id:'email', label:'Email Address', type:'email', plh:'name@college.edu', icon:'mail' },
              { id:'password', label:'Password', type:'password', plh:'Min 6 characters', icon:'lock' },
            ].map(({ id, label, type, plh, icon }) => (
              <div key={id} className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1">{label}</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">{icon}</span>
                  <input
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent border-0 border-b-2 border-outline-variant focus:ring-0 focus:border-primary transition-all text-on-surface placeholder:text-outline/50 outline-none text-sm"
                    id={id} placeholder={plh} type={type}
                    value={form[id]} onChange={(e) => setForm({ ...form, [id]: e.target.value })}
                    required
                    minLength={id === 'password' ? 6 : undefined}
                  />
                </div>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Branch</label>
                <select
                  className="w-full py-3 px-3 bg-surface-container-low border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}
                >
                  {branches.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Year</label>
                <select
                  className="w-full py-3 px-3 bg-surface-container-low border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                >
                  {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              style={{ background: 'linear-gradient(135deg, #3525cd 0%, #4f46e5 100%)' }}
            >
              {loading ? 'Creating…' : 'Create Account'}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-outline-variant/15 text-center">
            <p className="text-on-surface-variant text-sm">
              Already have an account?{' '}
              <Link className="text-primary font-bold ml-1 hover:underline underline-offset-4" to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
