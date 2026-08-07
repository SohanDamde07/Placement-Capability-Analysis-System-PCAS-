import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard',  icon: 'home',        label: 'Home'         },
  { to: '/profile',    icon: 'psychology',  label: 'Skill Profile'},
  { to: '/analysis',   icon: 'leaderboard', label: 'Analytics'    },
  { to: '/roadmap',    icon: 'alt_route',   label: 'Roadmap'      },
  { to: '/assistant',  icon: 'smart_toy',   label: 'AI Assistant' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-64 rounded-3xl bg-surface-container-low shadow-sm flex flex-col p-4 z-40">
      {/* Logo */}
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center text-white shadow">
          <span className="material-symbols-outlined">psychology</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-indigo-700 font-headline leading-tight">PCAS</h2>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Intelligent Layer</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ` +
              (isActive
                ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container')
            }
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom user card */}
      <div className="mt-auto p-3 bg-primary rounded-2xl text-white">
        <p className="text-xs font-bold opacity-80 truncate">{user?.name || 'Student'}</p>
        <p className="text-[10px] opacity-60 mb-3 truncate">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="w-full py-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
