// Файл: src/hooks/useExport.ts
import { useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useFilteredGames } from './useGames';
import { exportToExcel, exportToPdf, exportAll } from '../core/services/exportService';

export function useExport() {
  const games = useGameStore((s) => s.games);
  const filteredGames = useFilteredGames();

  const handleExportExcel = useCallback(() => {
    if (games.length === 0) {
      alert('Нет игр для экспорта');
      return;
    }
    exportToExcel(games);
  }, [games]);

  const handleExportPdf = useCallback(() => {
    if (games.length === 0) {
      alert('Нет игр для экспорта');
      return;
    }
    exportToPdf(games);
  }, [games]);

  const handleExportFilteredExcel = useCallback(() => {
    if (filteredGames.length === 0) {
      alert('Нет отфильтрованных игр для экспорта');
      return;
    }
    exportToExcel(filteredGames, 'crescent-collection-filtered');
  }, [filteredGames]);

  const handleExportAll = useCallback(() => {
    if (games.length === 0) {
      alert('Нет игр для экспорта');
      return;
    }
    exportAll(games);
  }, [games]);

  return {
    exportExcel: handleExportExcel,
    exportPdf: handleExportPdf,
    exportFilteredExcel: handleExportFilteredExcel,
    exportAll: handleExportAll,
    totalGames: games.length,
    filteredCount: filteredGames.length,
  };
}