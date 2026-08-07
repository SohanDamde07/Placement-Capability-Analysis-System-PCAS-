import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { to: '/dashboard',  icon: 'home',        label: 'Home'         },
  { to: '/profile',    icon: 'psychology',  label: 'Skill Profile'},
  { to: '/analysis',   icon: 'leaderboard', label: 'Analytics'    },
  { to: '/roadmap',    icon: 'alt_route',   label: 'Roadmap'      },
  { to: '/assistant',  icon: 'smart_toy',   label: 'AI Assistant' },
];

export default function SidebarDark() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-64 rounded-3xl glass-card flex flex-col p-4 z-40 glow-border">
      {/* Logo */}
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-xl flex items-center justify-center text-primary shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <span className="material-symbols-outlined font-bold">psychology</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary font-headline leading-tight">PCAS Sentinel</h2>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold opacity-80">Intelligent Layer</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-2">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm border hover:bg-white/5 hover:border-white/10 active:scale-95 ` +
              (isActive
                ? 'bg-primary/20 text-primary border-primary/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                : 'text-on-surface-variant border-transparent')
            }
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Action Area */}
      <div className="mt-auto space-y-4">
        {/* Current user */}
        <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-sm font-bold text-slate-200 truncate">{user?.name || 'Student'}</p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
            <button
                onClick={toggleTheme}
                title="Switch to Light Mode"
                className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl text-slate-300 font-bold text-xs hover:bg-white/10 transition-all flex items-center justify-center"
            >
                <span className="material-symbols-outlined text-sm">light_mode</span>
            </button>
            <button
                onClick={handleLogout}
                title="Sign Out"
                className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl text-slate-300 font-bold text-xs hover:bg-white/10 transition-all flex items-center justify-center"
            >
                <span className="material-symbols-outlined text-sm">logout</span>
            </button>
        </div>
      </div>
    </aside>
  );
}
