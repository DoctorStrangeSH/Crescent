import { db } from '../db/database';

export async function exportDatabase(): Promise<void> {
  const games = await db.games.toArray();
  const cycles = await db.cycles.toArray();
  const backup = {
    version: '3.0',
    exportedAt: new Date().toISOString(),
    appName: 'Crescent',
    games,
    cycles,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `crescent-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importDatabase(file: File, mode: 'replace' | 'merge' = 'merge'): Promise<{ games: number; cycles: number }> {
  const text = await file.text();
  const backup = JSON.parse(text);
  if (!backup.games) throw new Error('Неверный формат');

  if (mode === 'replace') {
    await db.games.clear();
    await db.cycles.clear();
    await db.games.bulkAdd(backup.games);
    if (backup.cycles) await db.cycles.bulkAdd(backup.cycles);
    return { games: backup.games.length, cycles: backup.cycles?.length || 0 };
  } else {
    let gCount = 0, cCount = 0;
    for (const g of backup.games) {
      if (!(await db.games.get(g.id))) { await db.games.add(g); gCount++; }
    }
    if (backup.cycles) {
      for (const c of backup.cycles) {
        if (!(await db.cycles.get(c.id))) { await db.cycles.add(c); cCount++; }
      }
    }
    return { games: gCount, cycles: cCount };
  }
}