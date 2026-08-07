import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { exportToExcel } from '../../core/services/exportService';
import Button from './Button';

function ExportMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleExport = async () => { await exportToExcel(); setIsOpen(false); };

  return (
    <div className="relative" ref={menuRef}>
      <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />} onClick={() => setIsOpen(!isOpen)}>{''}</Button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-gray-900 border border-white/10 rounded-xl shadow-2xl py-1 z-50">
          <div className="px-4 py-2 border-b border-white/10"><p className="text-xs text-white/40">Экспорт</p></div>
          <button onClick={handleExport} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5"><FileSpreadsheet className="w-4 h-4 text-green-400" /><div><p className="font-medium">Excel (.xlsx)</p><p className="text-xs text-white/30">Коллекция</p></div></button>
        </div>
      )}
    </div>
  );
}

export default ExportMenu;