import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useGameStore } from '../../store/gameStore';
import { FileText } from 'lucide-react';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentGameId?: string | null;
}

function BulkAddModal({ isOpen, onClose, parentGameId }: BulkAddModalProps) {
  const [text, setText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const addGame = useGameStore(s => s.addGame);
  const games = useGameStore(s => s.games);

  const handleAdd = async () => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length === 0) return;
    setIsAdding(true);
    
    // Считаем текущее количество дополнений, чтобы начать с правильного sortOrder
    const existingExpansions = games.filter(g => g.parentId === parentGameId);
    const maxSortOrder = existingExpansions.reduce((max, g) => Math.max(max, g.sortOrder || 0), 0);
    
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
      const title = lines[i].trim();
      if (title) {
        await addGame({
          title,
          parentId: parentGameId || null,
          isSeries: false,
          status: 'wishlist',
          sortOrder: maxSortOrder + count + 1, // Уникальный sortOrder для каждой игры
        });
        count++;
      }
    }
    setIsAdding(false);
    setText('');
    alert(`✅ Добавлено ${count} игр`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Массовое добавление" size="md">
      <div className="space-y-4">
        <p className="text-sm text-surface-muted">
          Вставьте список игр — по одной на строку. Они добавятся в одиночные дополнения.
        </p>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={10}
          placeholder={`Проклятие ругару\nКарнавал ужасов\nЛабиринты безумия\n...`}
          className="w-full px-3 py-2 bg-surface-hover dark:bg-surface-hover-dark border border-surface-border dark:border-surface-border-dark rounded-xl text-sm text-gray-900 dark:text-white resize-none font-mono" autoFocus />
        <div className="flex items-center justify-between">
          <span className="text-xs text-surface-muted">{text.split('\n').filter(l => l.trim()).length} игр</span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Отмена</Button>
            <Button onClick={handleAdd} isLoading={isAdding} icon={<FileText className="w-4 h-4" />}>Добавить все</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default BulkAddModal;