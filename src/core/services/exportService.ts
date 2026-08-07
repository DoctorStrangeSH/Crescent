import * as XLSX from 'xlsx';
import { db } from '../db/database';

export async function exportToExcel(): Promise<void> {
  const games = await db.games.toArray();
  const rows = games.map(g => [
    g.title, g.titleOriginal || '', g.status === 'owned' ? 'Есть' : 'Хочу',
    g.year || '', g.publisher || '', g.playerCountMin + '-' + g.playerCountMax,
    g.playTimeMin + '-' + g.playTimeMax, g.complexity,
    g.purchasePrice || '', g.language, g.hasProtectors ? 'Да' : 'Нет',
    g.isFavorite ? '⭐' : '', g.genres.join(', '), g.mechanics.join(', '),
    g.tags.join(', '), g.notes || '',
  ]);
  const ws = XLSX.utils.aoa_to_sheet([['Название', 'Ориг.', 'Статус', 'Год', 'Издатель', 'Игроки', 'Время', 'Сложность', 'Цена', 'Язык', 'Протекторы', 'Избр.', 'Жанры', 'Механики', 'Теги', 'Заметки'], ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Коллекция');
  XLSX.writeFile(wb, `crescent-${new Date().toISOString().split('T')[0]}.xlsx`);
}