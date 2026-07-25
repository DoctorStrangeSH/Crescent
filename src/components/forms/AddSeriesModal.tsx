// Файл: src/components/forms/AddSeriesModal.tsx
import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useGameStore } from '../../store/gameStore';

interface AddSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddSeriesModal({ isOpen, onClose }: AddSeriesModalProps) {
  const [title, setTitle] = useState('');
  const addSeries = useGameStore(s => s.addSeries);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addSeries({ title: title.trim() });
    setTitle('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Новая серия" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-crescent-muted mb-1.5">Название серии</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-crescent-accent/20 focus:border-crescent-accent/50"
            placeholder="Например: Ужас Аркхэма. Карточная игра"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="primary">Создать</Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddSeriesModal;