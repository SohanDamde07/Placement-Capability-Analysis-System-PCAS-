import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('student');
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  return (
    <div className="min-h-screen flex bg-surface overflow-hidden font-body">
      {/* Left brand panel */}
      <section className="hidden lg:flex lg:w-1/2 relative bg-surface-container-low overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-primary to-indigo-600"></div>
        </div>
        <div className="absolute inset-0 opacity-10 bg-gradient-to-tr from-secondary-container to-transparent"></div>
        <div className="relative z-20 flex flex-col justify-between p-16 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-primary font-bold">psychology</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-white font-headline">PCAS</span>
          </div>
          <div className="max-w-md">
            <h1 className="text-5xl font-extrabold text-white leading-tight mb-6 font-headline">
              Unlock your <br />
              <span className="text-secondary-fixed">Placement potential.</span>
            </h1>
            <p className="text-on-primary-container text-lg leading-relaxed opacity-90">
              The Intelligent Layer for skill analysis, roadmap generation, and career placement intelligence.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {['S','A','R'].map((l) => (
                <div key={l} className="w-10 h-10 rounded-full border-2 border-white bg-primary-container flex items-center justify-center text-white font-bold text-sm">
                  {l}
                </div>
              ))}
            </div>
            <p className="text-white text-sm font-medium">Joined by 12,000+ students & mentors</p>
          </div>
        </div>
      </section>

      {/* Right form panel */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-surface">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-on-surface mb-2 font-headline">Welcome Back</h2>
            <p className="text-on-surface-variant">Sign in to your intelligent dashboard.</p>
          </div>

          {/* Role tabs */}
          <div className="flex p-1 bg-surface-container-low rounded-xl mb-8">
            {['student','admin'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all capitalize ${
                  tab === t ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm font-medium">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                <input
                  className="w-full pl-12 pr-4 py-4 bg-transparent border-0 border-b-2 border-outline-variant focus:ring-0 focus:border-primary transition-all text-on-surface placeholder:text-outline/60 outline-none"
                  id="email" placeholder="name@university.edu" type="email"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Password</label>
                <a className="text-xs font-semibold text-primary hover:underline" href="#">Forgot?</a>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                <input
                  className="w-full pl-12 pr-4 py-4 bg-transparent border-0 border-b-2 border-outline-variant focus:ring-0 focus:border-primary transition-all text-on-surface placeholder:text-outline/60 outline-none"
                  id="password" placeholder="••••••••" type="password"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #3525cd 0%, #4f46e5 100%)' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-outline-variant/15 text-center">
            <p className="text-on-surface-variant text-sm">
              Don&apos;t have an account?{' '}
              <Link className="text-primary font-bold ml-1 hover:underline underline-offset-4" to="/register">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Floating AI button */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="bg-white/80 backdrop-blur-xl p-4 rounded-full shadow-2xl shadow-indigo-500/20 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
            <span className="material-symbols-outlined">chat_bubble</span>
          </div>
          <span className="text-on-surface font-semibold pr-2 text-sm">AI Assistant</span>
        </div>
      </div>
    </div>
  );
}
