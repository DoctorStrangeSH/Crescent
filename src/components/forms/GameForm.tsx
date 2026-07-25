// Файл: src/components/forms/GameForm.tsx
import { type ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { GameFormData } from '../../hooks/useGameForm';
import Rating from '../ui/Rating';

interface GameFormProps {
  form: UseFormReturn<GameFormData>;
  children?: ReactNode;
}

const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-crescent-accent/20 focus:border-crescent-accent/50 transition-all";
const labelClass = "block text-xs font-medium text-crescent-muted mb-1";

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {error && <p className="mt-0.5 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function GameForm({ form, children }: GameFormProps) {
  const { register, formState: { errors }, watch, setValue } = form;
  const status = watch('status');
  const myRating = watch('myRating');

  return (
    <div className="space-y-5">
      {/* Основное */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Название *" error={errors.title?.message}>
          <input {...register('title')} className={inputClass} placeholder="Название игры" />
        </Field>
        <Field label="Оригинальное название">
          <input {...register('titleOriginal')} className={inputClass} />
        </Field>
        <Field label="Год">
          <input type="number" {...register('year', { valueAsNumber: true })} className={inputClass} />
        </Field>
        <Field label="Издатель">
          <input {...register('publisher')} className={inputClass} />
        </Field>
        <Field label="Авторы (через запятую)">
          <input {...register('designers')} className={inputClass} />
        </Field>
        <Field label="Художники">
          <input {...register('artists')} className={inputClass} />
        </Field>
        <Field label="Тип">
          <select {...register('isBaseGame')} className={inputClass}>
            <option value="true">Базовая игра</option>
            <option value="false">Дополнение / Сценарий</option>
          </select>
        </Field>
      </div>

      {/* Статус и рейтинг */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl p-4">
        <div>
          <label className={labelClass}>Статус</label>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => setValue('status', 'owned')}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                status === 'owned'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-emerald-300'
              }`}
            >
              ✅ Есть
            </button>
            <button
              type="button"
              onClick={() => setValue('status', 'wishlist')}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                status === 'wishlist'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-amber-300'
              }`}
            >
              🎯 Хочу
            </button>
          </div>
        </div>
        <div>
          <label className={labelClass}>Моя оценка</label>
          <div className="mt-1.5">
            <Rating value={myRating ?? null} onChange={(val) => setValue('myRating', val)} size="md" />
          </div>
        </div>
      </div>

      {/* Параметры */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Field label="Мин. игроков">
          <input type="number" {...register('playerCountMin', { valueAsNumber: true })} className={inputClass} />
        </Field>
        <Field label="Макс. игроков">
          <input type="number" {...register('playerCountMax', { valueAsNumber: true })} className={inputClass} />
        </Field>
        <Field label="Время (мин)">
          <input type="number" {...register('playTimeMin', { valueAsNumber: true })} className={inputClass} />
        </Field>
        <Field label="Сложность">
          <select {...register('complexity', { valueAsNumber: true })} className={inputClass}>
            <option value="1">1 — Очень лёгкая</option>
            <option value="2">2 — Лёгкая</option>
            <option value="3">3 — Средняя</option>
            <option value="4">4 — Сложная</option>
            <option value="5">5 — Очень сложная</option>
          </select>
        </Field>
      </div>

      {/* Жанры */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Жанры (через запятую)">
          <input {...register('genres')} className={inputClass} placeholder="стратегия, карточная" />
        </Field>
        <Field label="Механики (через запятую)">
          <input {...register('mechanics')} className={inputClass} placeholder="deck building, кооператив" />
        </Field>
      </div>

      {/* Детали */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Язык">
          <select {...register('language')} className={inputClass}>
            <option value="russian">🇷🇺 Русский</option>
            <option value="english">🇬🇧 Английский</option>
            <option value="languageIndependent">🎯 Языконезависимая</option>
            <option value="other">🌐 Другой</option>
          </select>
        </Field>
        <Field label="Цена (₽)">
          <input type="number" {...register('purchasePrice', { valueAsNumber: true })} className={inputClass} />
        </Field>
        <Field label="Протекторы">
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input type="checkbox" {...register('hasProtectors')} className="w-4 h-4 rounded accent-crescent-accent" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Компоненты в протекторах</span>
          </label>
        </Field>
        <Field label="Избранное">
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input type="checkbox" {...register('isFavorite')} className="w-4 h-4 rounded accent-crescent-accent" />
            <span className="text-sm text-gray-700 dark:text-gray-300">⭐ В избранное</span>
          </label>
        </Field>
      </div>

      {/* Ссылки */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="BGG"><input {...register('bggLink')} className={inputClass} /></Field>
        <Field label="Tesera"><input {...register('teseraLink')} className={inputClass} /></Field>
        <Field label="Hobby Games"><input {...register('hobbygameLink')} className={inputClass} /></Field>
      </div>

      {/* Заметки */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Заметки">
          <textarea {...register('notes')} rows={2} className={inputClass + " resize-none"} />
        </Field>
        <Field label="Не хватает компонентов">
          <textarea {...register('missingComponents')} rows={2} className={inputClass + " resize-none"} />
        </Field>
      </div>

      <Field label="Теги (через запятую)">
        <input {...register('tags')} className={inputClass} placeholder="подарок, редкое" />
      </Field>

      {children}
    </div>
  );
}

export default GameForm;