// Файл: src/core/services/exportService.ts
import * as XLSX from 'xlsx';
import { db } from '../db/database';
import type { BoardGame } from '../types/game';

function gamesToRows(games: BoardGame[], seriesMap: Map<string, string>): any[][] {
  const statusLabels: Record<string, string> = {
    owned: 'Есть',
    wishlist: 'Хочу купить',
  };
  const languageLabels: Record<string, string> = {
    russian: 'Русский',
    english: 'Английский',
    languageIndependent: 'Языконезависимая',
    other: 'Другой',
  };

  return games.map(g => [
    g.title,
    g.titleOriginal || '',
    statusLabels[g.status] || g.status,
    seriesMap.get(g.seriesId || '') || '—',
    g.year || '',
    g.publisher || '',
    g.playerCountMin + '-' + g.playerCountMax,
    g.playTimeMin + '-' + g.playTimeMax + ' мин',
    g.complexity,
    g.myRating || '',
    g.bggRating || '',
    g.purchasePrice ? g.purchasePrice + ' ₽' : '',
    g.purchaseDate ? new Date(g.purchaseDate).toLocaleDateString('ru-RU') : '',
    languageLabels[g.language] || g.language,
    g.hasProtectors ? 'Да' : 'Нет',
    g.isFavorite ? '⭐' : '',
    g.genres.join(', '),
    g.mechanics.join(', '),
    g.tags.join(', '),
    g.notes || '',
  ]);
}

const HEADERS = [
  'Название',
  'Оригинальное название',
  'Статус',
  'Серия',
  'Год',
  'Издатель',
  'Игроки',
  'Время',
  'Сложность',
  'Моя оценка',
  'Рейтинг BGG',
  'Цена',
  'Дата покупки',
  'Язык',
  'Протекторы',
  'Избранное',
  'Жанры',
  'Механики',
  'Теги',
  'Заметки',
];

export async function exportToExcel(): Promise<void> {
  try {
    const games = await db.games.toArray();
    const series = await db.series.toArray();

    // Карта seriesId → название серии
    const seriesMap = new Map<string, string>();
    series.forEach(s => seriesMap.set(s.id, s.title));

    const rows = gamesToRows(games, seriesMap);

    // Лист «Коллекция»
    const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...rows]);
    ws['!cols'] = HEADERS.map(() => ({ wch: 22 }));

    // Лист «Статистика»
    const owned = games.filter(g => g.status === 'owned').length;
    const wishlist = games.filter(g => g.status === 'wishlist').length;
    const totalValue = games.reduce((sum, g) => sum + (g.purchasePrice || 0), 0);

    const statsData = [
      ['Показатель', 'Значение'],
      ['Всего игр', games.length],
      ['В коллекции', owned],
      ['Хочу купить', wishlist],
      ['Серий', series.length],
      ['Общая стоимость', totalValue + ' ₽'],
    ];
    const wsStats = XLSX.utils.aoa_to_sheet(statsData);
    wsStats['!cols'] = [{ wch: 25 }, { wch: 20 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Коллекция');
    XLSX.utils.book_append_sheet(wb, wsStats, 'Статистика');

    XLSX.writeFile(wb, `crescent-export-${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (err) {
    console.error('Ошибка экспорта:', err);
    throw new Error('Не удалось экспортировать данные');
  }
}