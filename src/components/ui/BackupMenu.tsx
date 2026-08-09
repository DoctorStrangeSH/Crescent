import { useState, useRef, useEffect } from 'react';
import { Database, Download, Upload } from 'lucide-react';
import { exportDatabase, importDatabase } from '../../core/services/backupService';
import { useGameStore } from '../../store/gameStore';
import Button from './Button';

function BackupMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const loadAll = useGameStore(s => s.loadAll);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleExport = async () => {
    try { await exportDatabase(); setMsg({ text: '✅ Готово!', type: 'success' }); } catch { setMsg({ text: '❌ Ошибка', type: 'error' }); }
    setTimeout(() => setMsg(null), 3000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const mode = window.confirm('ОК — заменить, Отмена — добавить') ? 'replace' : 'merge';
      const r = await importDatabase(file, mode);
      await loadAll();
      setMsg({ text: `✅ Игр: ${r.games}, циклов: ${r.cycles}`, type: 'success' }); setIsOpen(false);
    } catch (err: any) { setMsg({ text: `❌ ${err.message}`, type: 'error' }); }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button variant="ghost" size="sm" icon={<Database className="w-4 h-4" />} onClick={() => setIsOpen(!isOpen)}>{''}</Button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-white dark:bg-gray-900 border border-surface-border dark:border-surface-border-dark rounded-xl shadow-2xl py-1 z-50">
          <div className="px-4 py-2 border-b border-surface-border dark:border-surface-border-dark"><p className="text-xs text-surface-muted">Резервная копия</p></div>
          <button onClick={handleExport} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover dark:hover:bg-surface-hover-dark"><Download className="w-4 h-4 text-green-500" /><div><p className="font-medium">Скачать JSON</p><p className="text-xs text-surface-muted">Игры и циклы</p></div></button>
          <button onClick={() => fileRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover dark:hover:bg-surface-hover-dark"><Upload className="w-4 h-4 text-blue-500" /><div><p className="font-medium">Загрузить JSON</p><p className="text-xs text-surface-muted">Восстановить</p></div></button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          {msg && <div className="px-4 py-2 border-t border-surface-border dark:border-surface-border-dark"><p className={`text-xs ${msg.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{msg.text}</p></div>}
        </div>
      )}
    </div>
  );
}

export default BackupMenu;