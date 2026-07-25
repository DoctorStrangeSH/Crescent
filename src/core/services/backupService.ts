// Файл: src/core/services/backupService.ts
import { db } from '../db/database';
import type { BoardGame, GameSeries, GameCycle } from '../types/game';

/**
 * Экспортирует всю базу данных в JSON-файл
 */
export async function exportDatabase(): Promise<void> {
  try {
    const games = await db.games.toArray();
    const series = await db.series.toArray();
    const cycles = await db.cycles.toArray();

    const backup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      appName: 'Crescent',
      gamesCount: games.length,
      seriesCount: series.length,
      cyclesCount: cycles.length,
      games: games.map(g => ({
        ...g,
        createdAt: g.createdAt instanceof Date ? g.createdAt.toISOString() : g.createdAt,
        updatedAt: g.updatedAt instanceof Date ? g.updatedAt.toISOString() : g.updatedAt,
        purchaseDate: g.purchaseDate instanceof Date ? g.purchaseDate.toISOString() : g.purchaseDate,
      })),
      series: series.map(s => ({
        ...s,
        createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
        updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : s.updatedAt,
      })),
      cycles: cycles.map(c => ({
        ...c,
        createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
        updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : c.updatedAt,
      })),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crescent-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Ошибка экспорта базы:', err);
    throw new Error('Не удалось экспортировать данные');
  }
}

/**
 * Импортирует базу данных из JSON-файла
 */
export async function importDatabase(
  file: File,
  mode: 'replace' | 'merge' = 'merge'
): Promise<{ importedGames: number; skippedGames: number; importedSeries: number; skippedSeries: number; importedCycles: number; skippedCycles: number }> {
  try {
    const text = await file.text();
    const backup = JSON.parse(text);

    if (!backup.games || !Array.isArray(backup.games)) {
      throw new Error('Неверный формат файла бэкапа');
    }

    let importedGames = 0;
    let skippedGames = 0;
    let importedSeries = 0;
    let skippedSeries = 0;
    let importedCycles = 0;
    let skippedCycles = 0;

    // Преобразуем даты обратно в объекты Date
    const games: BoardGame[] = (backup.games || []).map((g: any) => ({
      ...g,
      createdAt: new Date(g.createdAt),
      updatedAt: new Date(g.updatedAt),
      purchaseDate: g.purchaseDate ? new Date(g.purchaseDate) : null,
    }));

    const seriesList: GameSeries[] = (backup.series || []).map((s: any) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
    }));

    const cyclesList: GameCycle[] = (backup.cycles || []).map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
    }));

    if (mode === 'replace') {
      // Очищаем всё и загружаем заново
      await db.games.clear();
      await db.series.clear();
      await db.cycles.clear();

      await db.series.bulkAdd(seriesList);
      await db.cycles.bulkAdd(cyclesList);
      await db.games.bulkAdd(games);

      importedSeries = seriesList.length;
      importedCycles = cyclesList.length;
      importedGames = games.length;
    } else {
      // Merge: добавляем только новые

      // Серии
      for (const s of seriesList) {
        const exists = await db.series.get(s.id);
        if (!exists) {
          await db.series.add(s);
          importedSeries++;
        } else {
          skippedSeries++;
        }
      }

      // Циклы
      for (const c of cyclesList) {
        const exists = await db.cycles.get(c.id);
        if (!exists) {
          await db.cycles.add(c);
          importedCycles++;
        } else {
          skippedCycles++;
        }
      }

      // Игры
      for (const g of games) {
        const exists = await db.games.get(g.id);
        if (!exists) {
          await db.games.add(g);
          importedGames++;
        } else {
          skippedGames++;
        }
      }
    }

    return { importedGames, skippedGames, importedSeries, skippedSeries, importedCycles, skippedCycles };
  } catch (err) {
    console.error('Ошибка импорта базы:', err);
    throw new Error('Не удалось импортировать данные. Проверьте формат файла.');
  }
}

/**
 * Создаёт автоматический бэкап в localStorage
 */
export async function autoBackup(): Promise<void> {
  try {
    const games = await db.games.toArray();
    const series = await db.series.toArray();
    const cycles = await db.cycles.toArray();
    const backup = {
      timestamp: Date.now(),
      games,
      series,
      cycles,
    };
    localStorage.setItem('crescent-autobackup', JSON.stringify(backup));
  } catch {
    // Молча игнорируем ошибки автобэкапа
  }
}

/**
 * Восстанавливает из автоматического бэкапа
 */
export async function restoreAutoBackup(): Promise<number> {
  try {
    const raw = localStorage.getItem('crescent-autobackup');
    if (!raw) return 0;

    const backup = JSON.parse(raw);

    if (backup.series) {
      const series: GameSeries[] = backup.series.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
      }));
      await db.series.bulkPut(series);
    }

    if (backup.cycles) {
      const cycles: GameCycle[] = backup.cycles.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      }));
      await db.cycles.bulkPut(cycles);
    }

    if (backup.games) {
      const games: BoardGame[] = backup.games.map((g: any) => ({
        ...g,
        createdAt: new Date(g.createdAt),
        updatedAt: new Date(g.updatedAt),
        purchaseDate: g.purchaseDate ? new Date(g.purchaseDate) : null,
      }));
      await db.games.bulkPut(games);
      return games.length;
    }

    return 0;
  } catch {
    return 0;
  }
}