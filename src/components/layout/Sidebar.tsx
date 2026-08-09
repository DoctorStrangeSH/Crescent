import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LibraryBig, PlusCircle, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

const nav = [
  { name: 'Дашборд', href: '/', icon: LayoutDashboard },
  { name: 'Коллекция', href: '/collection', icon: LibraryBig },
];

function Sidebar() {
  const openAddGameModal = useUIStore(s => s.openAddGameModal);
  const isSidebarOpen = useUIStore(s => s.isSidebarOpen);
  const toggleSidebar = useUIStore(s => s.toggleSidebar);

  return (
    <>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={toggleSidebar} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-surface-dark border-r border-surface-border dark:border-surface-border-dark transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between h-14 px-5 border-b border-surface-border dark:border-surface-border-dark">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-crescent-accent to-crescent-gold flex items-center justify-center text-sm shadow-lg">🌙</div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Crescent</h1>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden p-1.5 rounded-lg text-surface-muted hover:text-gray-700 dark:hover:text-white hover:bg-surface-hover dark:hover:bg-surface-hover-dark"><X className="w-4 h-4" /></button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(item => (
            <NavLink key={item.name} to={item.href} onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
              className={({ isActive }) => `flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${isActive ? 'bg-crescent-accent/10 text-crescent-accent dark:text-crescent-accent-light' : 'text-surface-muted dark:text-surface-muted-dark hover:text-gray-700 dark:hover:text-white hover:bg-surface-hover dark:hover:bg-surface-hover-dark'}`}>
              <item.icon className="w-4 h-4 mr-2.5 flex-shrink-0" />{item.name}
            </NavLink>
          ))}
          <div className="pt-3 mt-3 border-t border-surface-border dark:border-surface-border-dark">
            <button onClick={() => openAddGameModal()} className="flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl text-surface-muted dark:text-surface-muted-dark hover:text-gray-700 dark:hover:text-white hover:bg-surface-hover dark:hover:bg-surface-hover-dark transition-all">
              <PlusCircle className="w-4 h-4 mr-2.5" />Добавить игру
            </button>
          </div>
        </nav>
        <div className="p-4 border-t border-surface-border dark:border-surface-border-dark"><p className="text-[10px] text-center text-surface-muted dark:text-surface-muted-dark">Crescent v3.0</p></div>
      </aside>
    </>
  );
}

export default Sidebar;