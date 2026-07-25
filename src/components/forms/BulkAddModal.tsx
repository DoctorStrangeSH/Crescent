// Файл: src/components/forms/BulkAddModal.tsx
import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useGameStore } from '../../store/gameStore';
import { FileText } from 'lucide-react';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  seriesId?: string | null;
}

function BulkAddModal({ isOpen, onClose, seriesId }: BulkAddModalProps) {
  const [text, setText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const addGame = useGameStore(s => s.addGame);

  const handleAdd = async () => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length === 0) return;

    setIsAdding(true);
    let count = 0;

    for (const line of lines) {
      const title = line.trim();
      if (title) {
        await addGame({
          title,
          seriesId: seriesId || null,
          status: 'wishlist',
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
    <Modal isOpen={isOpen} onClose={onClose} title="Массовое добавление игр" size="md">
      <div className="space-y-4">
        <p className="text-sm text-crescent-muted">
          Вставьте список игр — по одной на строку. Они добавятся со статусом «Хочу купить».
        </p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={10}
          placeholder={`Проклятие ругару\nКарнавал ужасов\nЛабиринты безумия\n...`}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-crescent-accent/20 resize-none font-mono"
          autoFocus
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-crescent-muted">
            {text.split('\n').filter(l => l.trim()).length} игр
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Отмена</Button>
            <Button onClick={handleAdd} isLoading={isAdding} icon={<FileText className="w-4 h-4" />}>
              Добавить все
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default BulkAddModal;