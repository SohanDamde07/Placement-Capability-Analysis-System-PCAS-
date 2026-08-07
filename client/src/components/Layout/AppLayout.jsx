import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import SidebarDark from '../dark-mode-ui/SidebarDark';
import TopBarDark from '../dark-mode-ui/TopBarDark';
import { useTheme } from '../../context/ThemeContext';

export default function AppLayout() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-surface text-on-surface dark' : 'bg-surface text-on-surface'}`}>
      {theme === 'dark' ? <SidebarDark /> : <Sidebar />}
      <div className={`ml-72 mr-4 mt-4 h-[calc(100vh-2rem)] flex flex-col justify-start overflow-y-auto rounded-3xl no-scrollbar ${theme === 'dark' ? 'bg-surface/50 backdrop-blur-3xl border border-white/5 shadow-2xl relative' : ''}`}>
        
        {theme === 'dark' ? <TopBarDark /> : <TopBar />}
        <main className={`flex-1 pb-12 ${theme === 'dark' ? 'relative z-10 p-8' : 'p-6'}`}>
          <Outlet />
        </main>

        {/* Glow effect for dark main container background */}
        {theme === 'dark' && <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>}
      </div>
    </div>
  );
}
