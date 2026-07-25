// Файл: src/components/ui/BackupMenu.tsx
import { useState, useRef, useEffect } from 'react';
import { Database, Download, Upload } from 'lucide-react';
import { exportDatabase, importDatabase } from '../../core/services/backupService';
import { useGameStore } from '../../store/gameStore';
import Button from './Button';

function BackupMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadAll = useGameStore((s) => s.loadAll);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setMessage(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async () => {
    try {
      await exportDatabase();
      setMessage({ text: '✅ Бэкап сохранён!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ text: '❌ Ошибка экспорта', type: 'error' });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const mode = window.confirm(
        'Нажмите "ОК" чтобы заменить всю коллекцию импортируемой.\nНажмите "Отмена" чтобы добавить только новые.'
      )
        ? 'replace'
        : 'merge';

      const result = await importDatabase(file, mode);
      await loadAll();

      const parts: string[] = [];
      if (result.importedSeries > 0 || result.skippedSeries > 0) {
        parts.push(`📚 Серий: ${result.importedSeries}` + (result.skippedSeries > 0 ? ` (пропущено: ${result.skippedSeries})` : ''));
      }
      if (result.importedGames > 0 || result.skippedGames > 0) {
        parts.push(`🎲 Игр: ${result.importedGames}` + (result.skippedGames > 0 ? ` (пропущено: ${result.skippedGames})` : ''));
      }
      if (result.importedCycles > 0 || result.skippedCycles > 0) {
        parts.push(`📦 Циклов: ${result.importedCycles}` + (result.skippedCycles > 0 ? ` (пропущено: ${result.skippedCycles})` : ''));
      }

      setMessage({
        text: `✅ ${parts.join(', ')}`,
        type: 'success',
      });
      setIsOpen(false);
    } catch (err) {
      setMessage({
        text: err instanceof Error ? `❌ ${err.message}` : '❌ Ошибка импорта',
        type: 'error',
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        icon={<Database className="w-4 h-4" />}
        onClick={() => setIsOpen(!isOpen)}
        title="Резервная копия"
      >
        {''}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Резервная копия
            </p>
          </div>

          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4 text-green-500" />
            <div className="text-left">
              <p className="font-medium">Скачать бэкап (JSON)</p>
              <p className="text-xs text-gray-400">Игры, серии и циклы</p>
            </div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Upload className="w-4 h-4 text-blue-500" />
            <div className="text-left">
              <p className="font-medium">Загрузить бэкап</p>
              <p className="text-xs text-gray-400">Восстановить всю коллекцию</p>
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          {message && (
            <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
              <p className={`text-xs ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {message.text}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BackupMenu;