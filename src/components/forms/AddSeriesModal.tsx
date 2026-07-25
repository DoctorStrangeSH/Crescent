// Файл: src/components/forms/AddSeriesModal.tsx
import { useState, useRef } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useGameStore } from '../../store/gameStore';
import { Image, Upload } from 'lucide-react';

interface AddSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSeriesId?: string | null;
}

function AddSeriesModal({ isOpen, onClose, editingSeriesId }: AddSeriesModalProps) {
  const seriesList = useGameStore(s => s.series);
  const addSeries = useGameStore(s => s.addSeries);
  const updateSeries = useGameStore(s => s.updateSeries);
  const editingSeries = editingSeriesId ? seriesList.find(s => s.id === editingSeriesId) : undefined;

  const [title, setTitle] = useState(editingSeries?.title || '');
  const [titleOriginal, setTitleOriginal] = useState(editingSeries?.titleOriginal || '');
  const [description, setDescription] = useState(editingSeries?.description || '');
  const [photoUrl, setPhotoUrl] = useState(editingSeries?.photoUrl || '');
  const [photoPreview, setPhotoPreview] = useState(editingSeries?.photoUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!editingSeries;

  // Конвертация файла в base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Файл слишком большой. Максимум 5 МБ.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPhotoUrl(result);
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEditing && editingSeries) {
      await updateSeries(editingSeries.id, {
        title: title.trim(),
        titleOriginal: titleOriginal.trim(),
        description: description.trim(),
        photoUrl: photoUrl || null,
      });
    } else {
      await addSeries({
        title: title.trim(),
        titleOriginal: titleOriginal.trim(),
        description: description.trim(),
        photoUrl: photoUrl || null,
      });
    }
    setTitle('');
    setTitleOriginal('');
    setDescription('');
    setPhotoUrl('');
    setPhotoPreview('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Редактировать серию' : 'Новая серия'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Обложка */}
        <div>
          <label className="block text-xs font-medium text-crescent-muted mb-1.5">Обложка серии</label>
          <div className="flex items-center gap-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors overflow-hidden flex-shrink-0"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Обложка" className="w-full h-full object-cover" />
              ) : (
                <Image className="w-6 h-6 text-crescent-muted" />
              )}
            </div>
            <div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<Upload className="w-3.5 h-3.5" />}
                onClick={() => fileInputRef.current?.click()}
              >
                Загрузить
              </Button>
              <p className="text-[10px] text-crescent-muted mt-1">JPG, PNG до 5 МБ</p>
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => { setPhotoUrl(''); setPhotoPreview(''); }}
                  className="text-[10px] text-red-500 hover:underline mt-1"
                >
                  Удалить
                </button>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-crescent-muted mb-1.5">Название серии *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-crescent-accent/20 focus:border-crescent-accent/50"
            placeholder="Например: Ужас Аркхэма. Карточная игра"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-crescent-muted mb-1.5">Оригинальное название</label>
          <input
            value={titleOriginal}
            onChange={e => setTitleOriginal(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-crescent-accent/20 focus:border-crescent-accent/50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-crescent-muted mb-1.5">Описание</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-crescent-accent/20 focus:border-crescent-accent/50 resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="primary">{isEditing ? 'Сохранить' : 'Создать'}</Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddSeriesModal;