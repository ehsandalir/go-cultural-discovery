import { z } from 'zod';
import { VIBES } from './vibes';

export const CATEGORIES = ['movies', 'music', 'books', 'style'] as const;
export type Category = typeof CATEGORIES[number];
export const favoriteSchema = z.object({ title: z.string().trim().min(1).max(120), source: z.enum(['manual', 'tmdb', 'google-books', 'spotify']), id: z.string().max(120).optional() }).strict();
const favoriteList = z.array(favoriteSchema).max(3).refine(items => new Set(items.map(i => i.title.toLowerCase())).size === items.length, 'Favorites must be distinct');
export const favoritesSchema = z.object({ movies: favoriteList, music: favoriteList, books: favoriteList, style: favoriteList }).strict();
export const preferencesSchema = z.object({ name: z.string().trim().max(60), age: z.number().int().min(1).max(120).nullable(), gender: z.string().trim().max(60).nullable(), country: z.string().trim().max(80), language: z.string().trim().min(1).max(60), favorites: favoritesSchema, saveConsent: z.literal(true), aiConsent: z.boolean() }).strict();
export type Favorite = z.infer<typeof favoriteSchema>;
export type Favorites = z.infer<typeof favoritesSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
export function emptyFavorites(): Favorites { return { movies: [], music: [], books: [], style: [] }; }
export const PRESETS = ['quiet-comfort', 'melancholic-beauty', 'playful-joy', 'intellectual-maze'] as const;
export const analysisSchema = z.object({ preset: z.enum(PRESETS), atmosphere: z.enum(['soft', 'intense']), interests: z.array(z.enum(['cinema', 'reading', 'music', 'style'])).max(4) }).strict();
export type RoomPreset = z.infer<typeof analysisSchema>;
export const ATMOSPHERES = VIBES.flatMap(v => (['soft', 'intense'] as const).map(atmosphere => ({ vibe: v.id, atmosphere, id: `${v.id}-${atmosphere}` })));
export const RATE_LIMITS = { catalog: { requests: 20, seconds: 60 }, analysis: { requests: 5, seconds: 3600 } } as const;
/** Excludes demographics and ALL Spotify-derived content from AI ingestion. */
export function aiFavorites(favorites: Favorites) {
  return Object.fromEntries(CATEGORIES.map(c => [c, favorites[c].filter(f => f.source !== 'spotify').map(f => f.title)]));
}
/** Based only on explicit category selections, not inferred personality or sensitive attributes. */
export function fallbackPreset(favorites: Favorites): RoomPreset {
  const interests: RoomPreset['interests'] = [];
  if (favorites.movies.length) interests.push('cinema');
  if (favorites.books.length) interests.push('reading');
  if (favorites.music.length) interests.push('music');
  if (favorites.style.length) interests.push('style');
  return { preset: favorites.books.length > favorites.movies.length ? 'intellectual-maze' : favorites.music.length > favorites.books.length ? 'playful-joy' : 'quiet-comfort', atmosphere: 'soft', interests };
}