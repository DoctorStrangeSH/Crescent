// Файл: src/components/ui/ExportMenu.tsx
import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { exportToExcel } from '../../core/services/exportService';
import Button from './Button';

function ExportMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToExcel();
      setIsOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка экспорта');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        icon={<Download className="w-4 h-4" />}
        onClick={() => setIsOpen(!isOpen)}
        title="Экспорт"
      >
        {''}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Экспорт коллекции</p>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 text-crescent-accent animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-green-500" />
            )}
            <div className="text-left">
              <p className="font-medium">Excel (.xlsx)</p>
              <p className="text-xs text-gray-400">Игры, серии, статистика</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

export default ExportMenu;