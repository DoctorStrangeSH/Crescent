// Файл: src/components/forms/BggImportButton.tsx
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Download } from 'lucide-react';
import Button from '../ui/Button';
import { importFromBggForForm } from '../../core/services/importService';
import type { GameFormData } from '../../hooks/useGameForm';

interface BggImportButtonProps {
  form: UseFormReturn<GameFormData>;
}

function BggImportButton({ form }: BggImportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [bggUrl, setBggUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleImport = async () => {
    if (!bggUrl.trim()) {
      setError('Введите ссылку или ID игры');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const data = await importFromBggForForm(bggUrl.trim());

      if (!data) {
        setError('Не удалось получить данные');
        return;
      }

      // Заполняем форму
      form.setValue('title', data.title);
      if (data.titleOriginal) form.setValue('titleOriginal', data.titleOriginal);
      if (data.year) form.setValue('year', data.year);
      if (data.publisher) form.setValue('publisher', data.publisher);
      if (data.designers) form.setValue('designers', data.designers);
      if (data.artists) form.setValue('artists', data.artists);
      if (data.playerCountMin) form.setValue('playerCountMin', data.playerCountMin);
      if (data.playerCountMax) form.setValue('playerCountMax', data.playerCountMax);
      if (data.playTimeMin) form.setValue('playTimeMin', data.playTimeMin);
      if (data.playTimeMax) form.setValue('playTimeMax', data.playTimeMax);
      if (data.age) form.setValue('age', data.age);
      if (data.complexity) form.setValue('complexity', data.complexity as any);
      if (data.bggRating) form.setValue('bggRating', data.bggRating);
      if (data.bggLink) form.setValue('bggLink', data.bggLink);
      if (data.genres) form.setValue('genres', data.genres);
      if (data.mechanics) form.setValue('mechanics', data.mechanics);
      if (data.notes) form.setValue('notes', data.notes);

      setSuccess(true);
      setBggUrl('');
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка импорта');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        icon={<Download className="w-4 h-4" />}
        onClick={() => setIsOpen(!isOpen)}
      >
        Импорт из BGG
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-4 z-50">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Импорт с BoardGameGeek
          </p>
          <p className="text-xs text-gray-500 mb-3">
            Вставьте ссылку на игру с BGG или её ID (например, 822 для Каркассона)
          </p>

          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={bggUrl}
              onChange={(e) => setBggUrl(e.target.value)}
              placeholder="https://boardgamegeek.com/boardgame/822/carcassonne"
              className="flex-1 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-crescent-accent"
              onKeyDown={(e) => e.key === 'Enter' && handleImport()}
              disabled={isLoading}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleImport}
              isLoading={isLoading}
            >
              Ок
            </Button>
          </div>

          {error && (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          )}
          {success && (
            <p className="text-xs text-green-500 mt-1">✅ Данные успешно загружены!</p>
          )}
        </div>
      )}
    </div>
  );
}

export default BggImportButton;