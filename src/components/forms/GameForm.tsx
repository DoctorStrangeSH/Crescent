import { type ReactNode, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { GameFormData } from '../../hooks/useGameForm';
import Button from '../ui/Button';
import { Image, Upload } from 'lucide-react';

interface GameFormProps {
  form: UseFormReturn<GameFormData>;
  children?: ReactNode;
  showKind?: boolean;
  showStatus?: boolean;
  showDetails?: boolean;
  isInsideCollection?: boolean;
}

const inputClass = "w-full px-3 py-2 bg-surface-hover dark:bg-surface-hover-dark border border-surface-border dark:border-surface-border-dark rounded-xl text-sm text-gray-900 dark:text-white placeholder-surface-muted focus:outline-none focus:ring-2 focus:ring-crescent-accent/50 transition-all";
const labelClass = "block text-xs font-medium text-surface-muted mb-1";

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <div><label className={labelClass}>{label}</label>{children}{error && <p className="mt-0.5 text-[11px] text-red-500">{error}</p>}</div>;
}

function GameForm({ form, children, showKind = true, showStatus = true, showDetails = true, isInsideCollection = false }: GameFormProps) {
  const { register, formState: { errors }, watch, setValue } = form;
  const status = watch('status');
  const kind = watch('kind');
  const photos = watch('photos');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(Array.isArray(photos) && photos.length > 0 ? photos[0] : null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert('Максимум 3 МБ'); return; }
    const reader = new FileReader();
    reader.onload = ev => { const r = ev.target?.result as string; setPhotoPreview(r); setValue('photos', [r] as any); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>Обложка</label>
        <div className="flex items-center gap-3">
          <div onClick={() => fileInputRef.current?.click()} className="w-28 h-28 rounded-2xl bg-surface-hover dark:bg-surface-hover-dark border border-surface-border dark:border-surface-border-dark flex items-center justify-center cursor-pointer hover:opacity-80 overflow-hidden">
            {photoPreview ? <img src={photoPreview} alt="" className="w-full h-full object-contain p-1" /> : <Image className="w-6 h-6 text-surface-muted" />}
          </div>
          <div>
            <Button type="button" variant="secondary" size="sm" icon={<Upload className="w-3.5 h-3.5" />} onClick={() => fileInputRef.current?.click()}>Загрузить</Button>
            <p className="text-[10px] text-surface-muted mt-1">JPG, PNG до 3 МБ</p>
            {photoPreview && <button type="button" onClick={() => { setPhotoPreview(null); setValue('photos', [] as any); }} className="text-[10px] text-red-500 hover:underline mt-1">Удалить</button>}
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
      </div>

      <Field label="Название *" error={errors.title?.message}>
        <input {...register('title')} className={inputClass} placeholder={isInsideCollection ? 'Название игры' : 'Название хранилища'} />
      </Field>
      <Field label="Оригинальное название"><input {...register('titleOriginal')} className={inputClass} /></Field>

      {showKind && isInsideCollection && (
        <div className="bg-surface-hover dark:bg-surface-hover-dark rounded-2xl p-4">
          <label className={labelClass}>Тип игры</label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <button type="button" onClick={() => setValue('kind', 'base')} className={`py-2.5 px-2 rounded-xl text-xs font-medium transition-all border ${kind === 'base' ? 'bg-blue-500 text-white border-blue-500 shadow-sm' : 'bg-white dark:bg-surface-card-dark text-surface-muted border-surface-border dark:border-surface-border-dark hover:border-blue-400'}`}>
              <span className="block text-base mb-0.5">🎯</span>Базовая игра
            </button>
            <button type="button" onClick={() => setValue('kind', 'expansion')} className={`py-2.5 px-2 rounded-xl text-xs font-medium transition-all border ${kind === 'expansion' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white dark:bg-surface-card-dark text-surface-muted border-surface-border dark:border-surface-border-dark hover:border-amber-400'}`}>
              <span className="block text-base mb-0.5">📦</span>Дополнение
            </button>
            <button type="button" onClick={() => setValue('kind', 'standalone')} className={`py-2.5 px-2 rounded-xl text-xs font-medium transition-all border ${kind === 'standalone' ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-white dark:bg-surface-card-dark text-surface-muted border-surface-border dark:border-surface-border-dark hover:border-emerald-400'}`}>
              <span className="block text-base mb-0.5">🎲</span>Самостоятельная
            </button>
          </div>
          <p className="text-[10px] text-surface-muted mt-2">
            {kind === 'base' ? '🎯 Базовая игра — основа, к которой покупаются дополнения' :
             kind === 'expansion' ? '📦 Дополнение — требует базовую игру' :
             '🎲 Самостоятельная — играется отдельно, не требует базу'}
          </p>
        </div>
      )}

      {showStatus && kind !== 'collection' && (
        <div className="bg-surface-hover dark:bg-surface-hover-dark rounded-2xl p-4">
          <label className={labelClass}>Статус</label>
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={() => setValue('status', 'owned')} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${status === 'owned' ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-white dark:bg-surface-card-dark text-surface-muted border-surface-border dark:border-surface-border-dark hover:border-emerald-400'}`}>✅ Есть</button>
            <button type="button" onClick={() => setValue('status', 'wishlist')} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${status === 'wishlist' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white dark:bg-surface-card-dark text-surface-muted border-surface-border dark:border-surface-border-dark hover:border-amber-400'}`}>🎯 Хочу</button>
          </div>
        </div>
      )}

      {showDetails && kind !== 'collection' && (
        <>
          <div className="grid grid-cols-4 gap-3">
            <Field label="Игроки"><input type="number" {...register('playerCountMin', { valueAsNumber: true })} className={inputClass} /></Field>
            <Field label="Макс"><input type="number" {...register('playerCountMax', { valueAsNumber: true })} className={inputClass} /></Field>
            <Field label="Время"><input type="number" {...register('playTimeMin', { valueAsNumber: true })} className={inputClass} /></Field>
            <Field label="Сложность"><select {...register('complexity', { valueAsNumber: true })} className={inputClass}><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Жанры"><input {...register('genres')} className={inputClass} /></Field>
            <Field label="Механики"><input {...register('mechanics')} className={inputClass} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Язык"><select {...register('language')} className={inputClass}><option value="russian">🇷🇺 Русский</option><option value="english">🇬🇧 Английский</option><option value="languageIndependent">🎯 Языконез.</option><option value="other">🌐 Другой</option></select></Field>
            <Field label="Цена"><input type="number" {...register('purchasePrice', { valueAsNumber: true })} className={inputClass} /></Field>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register('hasProtectors')} className="accent-crescent-accent" /><span className="text-sm">🛡️ Протекторы</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register('isFavorite')} className="accent-crescent-accent" /><span className="text-sm">⭐ Избранное</span></label>
          </div>
          <Field label="Заметки"><textarea {...register('notes')} rows={2} className={inputClass + " resize-none"} /></Field>
        </>
      )}

      {children}
    </div>
  );
}

export default GameForm;