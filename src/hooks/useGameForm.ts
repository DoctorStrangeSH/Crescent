import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUIStore } from '../store/uiStore';
import type { CreateGameData } from '../core/types/game';

const schema = z.object({
  collectionId: z.string().nullable().optional(),
  kind: z.enum(['collection', 'base', 'expansion', 'standalone']).optional().default('standalone'),
  title: z.string().min(1, 'Название обязательно'),
  titleOriginal: z.string().optional().default(''),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  publisher: z.string().optional().default(''),
  designers: z.string().optional().default(''),
  artists: z.string().optional().default(''),
  playerCountMin: z.number().int().min(1).optional().default(1),
  playerCountMax: z.number().int().min(1).optional().default(4),
  playTimeMin: z.number().int().min(1).optional().default(30),
  playTimeMax: z.number().int().min(1).optional().default(60),
  complexity: z.number().int().min(1).max(5).optional().default(2),
  genres: z.string().optional().default(''),
  mechanics: z.string().optional().default(''),
  status: z.enum(['owned', 'wishlist']).optional().default('owned'),
  purchaseDate: z.string().optional().default(''),
  purchasePrice: z.number().min(0).nullable().optional(),
  language: z.enum(['russian', 'english', 'languageIndependent', 'other']).optional().default('russian'),
  hasProtectors: z.boolean().optional().default(false),
  notes: z.string().optional().default(''),
  isFavorite: z.boolean().optional().default(false),
  tags: z.string().optional().default(''),
  photos: z.array(z.string()).optional().default([]),
});

export type GameFormData = z.infer<typeof schema>;

function str(v: string) { return v.split(',').map(s => s.trim()).filter(s => s); }

export function toGame(data: GameFormData): CreateGameData {
  return {
    collectionId: data.collectionId ?? null,
    kind: (data.kind || 'standalone') as 'collection' | 'base' | 'expansion' | 'standalone',
    title: data.title, titleOriginal: data.titleOriginal || '', year: data.year ?? null,
    publisher: data.publisher || '', designers: str(data.designers || ''), artists: str(data.artists || ''),
    playerCountMin: data.playerCountMin ?? 1, playerCountMax: data.playerCountMax ?? 4,
    bestPlayerCount: '', playTimeMin: data.playTimeMin ?? 30, playTimeMax: data.playTimeMax ?? 60,
    age: null, complexity: (data.complexity || 2) as 1|2|3|4|5, bggRating: null,
    bggLink: '', teseraLink: '', hobbygameLink: '',
    genres: str(data.genres || ''), mechanics: str(data.mechanics || ''),
    status: (data.status || 'owned') as 'owned' | 'wishlist',
    purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
    purchasePrice: data.purchasePrice ?? null,
    language: (data.language || 'russian') as 'russian' | 'english' | 'languageIndependent' | 'other',
    hasProtectors: data.hasProtectors ?? false, protectorDetails: '',
    notes: data.notes || '', photos: data.photos || [], isFavorite: data.isFavorite ?? false,
    tags: str(data.tags || ''), missingComponents: '', acquisitionSource: '', sortOrder: 0,
  };
}

export function useGameForm(def?: Partial<GameFormData>) {
  const cid = useUIStore(s => s.collectionId);
  return useForm<GameFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      collectionId: cid || null,
      // ВАЖНО: снаружи — collection (хранилище), внутри — expansion (дополнение)
      kind: cid ? 'expansion' : 'collection',
      title: '', titleOriginal: '', year: null, publisher: '', designers: '', artists: '',
      playerCountMin: 1, playerCountMax: 4, playTimeMin: 30, playTimeMax: 60,
      complexity: 2, genres: '', mechanics: '', status: 'owned',
      purchaseDate: '', purchasePrice: null, language: 'russian',
      hasProtectors: false, notes: '', isFavorite: false, tags: '', photos: [],
      ...def,
    },
  });
}