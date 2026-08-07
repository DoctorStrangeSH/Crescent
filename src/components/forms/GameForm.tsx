import { type ReactNode, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { GameFormData } from '../../hooks/useGameForm';
import Button from '../ui/Button';
import { Image, Upload } from 'lucide-react';

interface GameFormProps { form: UseFormReturn<GameFormData>; children?: ReactNode; }

const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-crescent-accent/50 transition-all";
const labelClass = "block text-xs font-medium text-white/60 mb-1";

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <div><label className={labelClass}>{label}</label>{children}{error && <p className="mt-0.5 text-[11px] text-red-400">{error}</p>}</div>;
}

function GameForm({ form, children }: GameFormProps) {
  const { register, formState: { errors }, watch, setValue } = form;
  const status = watch('status');
  const photos = watch('photos');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(Array.isArray(photos) && photos.length > 0 ? photos[0] : null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert('Максимум 3 МБ'); return; }
    const reader = new FileReader();
    reader.onload = ev => { const r = ev.target?.result as string; setPhotoPreview(r); setValue('photos', [r] as any); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>Фото</label>
        <div className="flex items-center gap-3">
          <div onClick={() => fileInputRef.current?.click()} className="w-28 h-28 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 overflow-hidden">
            {photoPreview ? <img src={photoPreview} alt="" className="w-full h-full object-contain p-1" /> : <Image className="w-6 h-6 text-white/30" />}
          </div>
          <div>
            <Button type="button" variant="secondary" size="sm" icon={<Upload className="w-3.5 h-3.5" />} onClick={() => fileInputRef.current?.click()}>Загрузить</Button>
            <p className="text-[10px] text-white/30 mt-1">JPG, PNG до 3 МБ</p>
            {photoPreview && <button type="button" onClick={() => { setPhotoPreview(null); setValue('photos', [] as any); }} className="text-[10px] text-red-400 hover:underline mt-1">Удалить</button>}
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Название *" error={errors.title?.message}><input {...register('title')} className={inputClass} placeholder="Название игры" /></Field>
        <Field label="Оригинальное название"><input {...register('titleOriginal')} className={inputClass} /></Field>
        <Field label="Год"><input type="number" {...register('year', { valueAsNumber: true })} className={inputClass} /></Field>
        <Field label="Издатель"><input {...register('publisher')} className={inputClass} /></Field>
        <Field label="Авторы"><input {...register('designers')} className={inputClass} /></Field>
        <Field label="Художники"><input {...register('artists')} className={inputClass} /></Field>
      </div>

      <div className="bg-white/5 rounded-2xl p-4">
        <label className={labelClass}>Статус</label>
        <div className="flex gap-2 mt-1">
          <button type="button" onClick={() => setValue('status', 'owned')} className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${status === 'owned' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white/5 text-white/50 border border-white/10 hover:border-emerald-500/50'}`}>✅ Есть</button>
          <button type="button" onClick={() => setValue('status', 'wishlist')} className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${status === 'wishlist' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white/5 text-white/50 border border-white/10 hover:border-amber-500/50'}`}>🎯 Хочу</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Field label="Мин. игроков"><input type="number" {...register('playerCountMin', { valueAsNumber: true })} className={inputClass} /></Field>
        <Field label="Макс. игроков"><input type="number" {...register('playerCountMax', { valueAsNumber: true })} className={inputClass} /></Field>
        <Field label="Время (мин)"><input type="number" {...register('playTimeMin', { valueAsNumber: true })} className={inputClass} /></Field>
        <Field label="Сложность"><select {...register('complexity', { valueAsNumber: true })} className={inputClass}><option value="1">1 — Лёгкая</option><option value="2">2</option><option value="3">3 — Средняя</option><option value="4">4</option><option value="5">5 — Сложная</option></select></Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Жанры"><input {...register('genres')} className={inputClass} placeholder="стратегия, карточная" /></Field>
        <Field label="Механики"><input {...register('mechanics')} className={inputClass} placeholder="deck building" /></Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Язык"><select {...register('language')} className={inputClass}><option value="russian">🇷🇺 Русский</option><option value="english">🇬🇧 Английский</option><option value="languageIndependent">🎯 Языконезависимая</option><option value="other">🌐 Другой</option></select></Field>
        <Field label="Цена (₽)"><input type="number" {...register('purchasePrice', { valueAsNumber: true })} className={inputClass} /></Field>
        <Field label="Протекторы"><label className="flex items-center gap-2 mt-2 cursor-pointer"><input type="checkbox" {...register('hasProtectors')} className="w-4 h-4 rounded accent-crescent-accent" /><span className="text-sm text-white/70">В протекторах</span></label></Field>
        <Field label="Избранное"><label className="flex items-center gap-2 mt-2 cursor-pointer"><input type="checkbox" {...register('isFavorite')} className="w-4 h-4 rounded accent-crescent-accent" /><span className="text-sm text-white/70">⭐ Избранное</span></label></Field>
      </div>

      <Field label="Заметки"><textarea {...register('notes')} rows={2} className={inputClass + " resize-none"} /></Field>
      <Field label="Теги"><input {...register('tags')} className={inputClass} placeholder="подарок, редкое" /></Field>

      {children}
    </div>
  );
}

export default GameForm;