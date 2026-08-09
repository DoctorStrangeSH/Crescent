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
  const games = useGameStore(s => s.games);

  const handleAdd = async () => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length === 0) return;
    setIsAdding(true);
    const existing = games.filter(g => g.collectionId === collectionId);
    const maxOrder = existing.reduce((max, g) => Math.max(max, g.sortOrder || 0), -1);
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
      await addGame({ title: lines[i].trim(), collectionId: collectionId || null, kind: 'expansion', status: 'wishlist', sortOrder: maxOrder + count + 1 });
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
        <p className="text-sm text-surface-muted">Вставьте список игр — по одной на строку.</p>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={10} placeholder={`Игра 1\nИгра 2\n...`} className="w-full px-3 py-2 bg-surface-hover dark:bg-surface-hover-dark border border-surface-border dark:border-surface-border-dark rounded-xl text-sm resize-none font-mono" autoFocus />
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