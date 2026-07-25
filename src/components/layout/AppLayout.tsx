// Файл: src/components/layout/AppLayout.tsx
import { type ReactNode, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUIStore } from '../../store/uiStore';

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-crescent-light dark:bg-crescent-dark">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;