// Файл: src/hooks/useGameForm.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUIStore } from '../store/uiStore';
import type { CreateBoardGameData } from '../core/types/game';

const gameFormSchema = z.object({
  seriesId: z.string().nullable().optional(),
  title: z.string().min(1, 'Название обязательно'),
  titleOriginal: z.string().optional().default(''),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  publisher: z.string().optional().default(''),
  designers: z.string().optional().default(''),
  artists: z.string().optional().default(''),
  playerCountMin: z.number().int().min(1).max(20).optional().default(1),
  playerCountMax: z.number().int().min(1).max(100).optional().default(4),
  bestPlayerCount: z.string().optional().default(''),
  playTimeMin: z.number().int().min(1).optional().default(30),
  playTimeMax: z.number().int().min(1).optional().default(60),
  age: z.number().int().min(0).max(21).nullable().optional(),
  complexity: z.number().int().min(1).max(5).optional().default(2),
  bggRating: z.number().min(0).max(10).nullable().optional(),
  bggLink: z.string().optional().default(''),
  teseraLink: z.string().optional().default(''),
  hobbygameLink: z.string().optional().default(''),
  genres: z.string().optional().default(''),
  mechanics: z.string().optional().default(''),
  status: z.enum(['owned', 'wishlist']).optional().default('owned'),
  myRating: z.number().int().min(1).max(10).nullable().optional(),
  purchaseDate: z.string().optional().default(''),
  purchasePrice: z.number().min(0).nullable().optional(),
  language: z.enum(['russian', 'english', 'languageIndependent', 'other']).optional().default('russian'),
  hasProtectors: z.boolean().optional().default(false),
  protectorDetails: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  isFavorite: z.boolean().optional().default(false),
  tags: z.string().optional().default(''),
  missingComponents: z.string().optional().default(''),
  acquisitionSource: z.string().optional().default(''),
  isBaseGame: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
  photos: z.array(z.string()).optional().default([]),
});

export type GameFormData = z.infer<typeof gameFormSchema>;

function strToArr(value: string): string[] {
  return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

export function formDataToCreateData(data: GameFormData): CreateBoardGameData {
  return {
    seriesId: data.seriesId ?? null,
    title: data.title,
    titleOriginal: data.titleOriginal || '',
    year: data.year ?? null,
    publisher: data.publisher || '',
    designers: strToArr(data.designers || ''),
    artists: strToArr(data.artists || ''),
    playerCountMin: data.playerCountMin ?? 1,
    playerCountMax: data.playerCountMax ?? 4,
    bestPlayerCount: data.bestPlayerCount || '',
    playTimeMin: data.playTimeMin ?? 30,
    playTimeMax: data.playTimeMax ?? 60,
    age: data.age ?? null,
    complexity: (data.complexity || 2) as 1|2|3|4|5,
    bggRating: data.bggRating ?? null,
    bggLink: data.bggLink || '',
    teseraLink: data.teseraLink || '',
    hobbygameLink: data.hobbygameLink || '',
    genres: strToArr(data.genres || ''),
    mechanics: strToArr(data.mechanics || ''),
    status: (data.status || 'owned') as 'owned'|'wishlist',
    myRating: data.myRating ?? null,
    purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
    purchasePrice: data.purchasePrice ?? null,
    language: (data.language || 'russian') as 'russian'|'english'|'languageIndependent'|'other',
    hasProtectors: data.hasProtectors ?? false,
    protectorDetails: data.protectorDetails || '',
    notes: data.notes || '',
    isFavorite: data.isFavorite ?? false,
    tags: strToArr(data.tags || ''),
    missingComponents: data.missingComponents || '',
    acquisitionSource: data.acquisitionSource || '',
    isBaseGame: data.isBaseGame ?? true,
    sortOrder: data.sortOrder ?? 0,
    photos: data.photos || [],
  };
}

export function useGameForm(defaultValues?: Partial<GameFormData>) {
  const pendingSeriesId = useUIStore((s) => s.pendingSeriesId);

  return useForm<GameFormData>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      seriesId: pendingSeriesId || null,
      title: '',
      titleOriginal: '',
      year: null,
      publisher: '',
      designers: '',
      artists: '',
      playerCountMin: 1,
      playerCountMax: 4,
      bestPlayerCount: '',
      playTimeMin: 30,
      playTimeMax: 60,
      age: null,
      complexity: 2,
      bggRating: null,
      bggLink: '',
      teseraLink: '',
      hobbygameLink: '',
      genres: '',
      mechanics: '',
      status: 'owned',
      myRating: null,
      purchaseDate: '',
      purchasePrice: null,
      language: 'russian',
      hasProtectors: false,
      protectorDetails: '',
      notes: '',
      isFavorite: false,
      tags: '',
      missingComponents: '',
      acquisitionSource: '',
      isBaseGame: true,
      sortOrder: 0,
      photos: [],
      ...defaultValues,
    },
  });
}