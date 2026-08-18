import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useGameStore } from '../../store/gameStore';
import { FileText } from 'lucide-react';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId?: string | null;
}

function BulkAddModal({ isOpen, onClose, collectionId }: BulkAddModalProps) {
  const [text, setText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const addGame = useGameStore(s => s.addGame);
  const addCycle = useGameStore(s => s.addCycle);
  const games = useGameStore(s => s.games);
  const cycles = useGameStore(s => s.cycles);

  const handleAdd = async () => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length === 0) return;
    setIsAdding(true);

    const collectionCycles = cycles.filter(c => c.collectionId === collectionId);
    const cycleMap = new Map(collectionCycles.map(c => [c.title.toLowerCase(), c.id]));
    let count = 0;

    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      const title = parts[0];
      if (!title) continue;

      const kindRaw = (parts[1] || 'доп').toLowerCase();
      const kind = kindRaw === 'база' ? 'base' : kindRaw === 'соло' ? 'standalone' : 'expansion';
      const cycleTitle = parts[2] || '';

      let cycleId: string | null = null;
      if (cycleTitle) {
        // Ищем цикл по названию
        let cid = cycleMap.get(cycleTitle.toLowerCase());
        if (!cid) {
          // Создаём новый цикл
          const newCycle = await addCycle({ title: cycleTitle, collectionId: collectionId || '' });
          cycleMap.set(cycleTitle.toLowerCase(), newCycle.id);
          cid = newCycle.id;
        }
        cycleId = cid;
      }

      const existing = games.filter(g => g.collectionId === collectionId && g.cycleId === cycleId);
      const maxOrder = existing.reduce((max, g) => Math.max(max, g.sortOrder || 0), -1);

      await addGame({
        title,
        collectionId: collectionId || null,
        kind,
        cycleId,
        status: 'wishlist',
        sortOrder: maxOrder + 1,
      });
      count++;
    }

    setIsAdding(false);
    setText('');
    alert(`✅ Добавлено ${count} игр`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Массовое добавление" size="md">
      <div className="space-y-4">
        <div className="bg-surface-hover dark:bg-surface-hover-dark rounded-2xl p-4 text-xs text-surface-muted space-y-1">
          <p className="font-medium text-gray-700 dark:text-white/80 mb-2">Формат: <code className="font-mono">Название|Тип|Цикл</code></p>
          <p>• Тип: <code className="font-mono">база</code>, <code className="font-mono">доп</code>, <code className="font-mono">соло</code></p>
          <p>• Цикл: название цикла (если нет — оставьте пусто)</p>
          <p>• Можно просто название — будет «доп»</p>
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={12}
          placeholder={`Ужас Аркхэма|база\nНаследие Данвича. Сыщики|доп|Наследие Данвича\nНаследие Данвича. Кампания|доп|Наследие Данвича\nПроклятие ругару|соло\nКарнавал ужасов|соло`}
          className="w-full px-3 py-2 bg-surface-hover dark:bg-surface-hover-dark border border-surface-border dark:border-surface-border-dark rounded-xl text-sm text-gray-900 dark:text-white resize-none font-mono"
          autoFocus
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-surface-muted">
            {text.split('\n').filter(l => l.trim()).length} игр
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Отмена</Button>
            <Button onClick={handleAdd} isLoading={isAdding} icon={<FileText className="w-4 h-4" />}>Добавить</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default BulkAddModal;