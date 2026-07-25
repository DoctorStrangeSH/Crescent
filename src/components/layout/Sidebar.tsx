// Файл: src/components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LibraryBig, PlusCircle, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

const navigation = [
  { name: 'Дашборд', href: '/', icon: LayoutDashboard },
  { name: 'Коллекция', href: '/collection', icon: LibraryBig },
];

function Sidebar() {
  const openAddGameModal = useUIStore((s) => s.openAddGameModal);
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={toggleSidebar} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        flex flex-col w-64
        bg-white/80 dark:bg-crescent-dark/80 backdrop-blur-xl
        border-r border-gray-200/60 dark:border-gray-800/60
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Логотип */}
        <div className="flex items-center justify-between h-14 px-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-crescent-accent/10 flex items-center justify-center text-lg">
              🌙
            </div>
            <h1 className="text-base font-title font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Crescent
            </h1>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Навигация */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-crescent-accent/10 text-crescent-accent font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                }`
              }
            >
              <item.icon className="w-4 h-4 mr-2.5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}

          <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800/50">
            <button
              onClick={() => openAddGameModal()}
              className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-xl transition-all duration-150 text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <PlusCircle className="w-4 h-4 mr-2.5 flex-shrink-0" />
              Добавить игру
            </button>
          </div>
        </nav>

        {/* Футер */}
        <div className="p-4">
          <p className="text-[10px] text-center text-gray-400 dark:text-gray-600">Crescent v2.0</p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;