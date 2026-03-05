import z from "zod";
import { songType } from "../../types/song_types/song.type";

// Create Song DTO
export const CreateSongDto = songType.pick({
    title: true,
    album: true,
    genre: true,
    visibility: true,
}).extend({
    releaseDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
    audioUrl: z.string().min(1, "Audio URL is required"),
    coverImageUrl: z.string().optional(),
    duration: z.number().positive().optional(), // Auto-calculated
});

export type CreateSongDto = z.infer<typeof CreateSongDto>;

// Update Song DTO
export const UpdateSongDto = CreateSongDto.partial();
export type UpdateSongDto = z.infer<typeof UpdateSongDto>;

// Query Songs DTO
export const QuerySongsDto = z.object({
    genre: z.enum([
        'pop',
        'rock',
        'hip-hop',
        'electronic',
        'soul',
        'country',
        'jazz',
        'classical',
        'latin',
        'folk',
        'blues',
        'reggae',
        'metal',
        'gospel',
        'other'
    ]).optional(),
    search: z.string().optional(),
    sortBy: z.enum(['title', 'releaseDate', 'playCount', 'createdAt']).optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    limit: z.number().int().positive().optional().default(20),
    page: z.number().int().positive().optional().default(1),
});

export type QuerySongsDto = z.infer<typeof QuerySongsDto>;

// Track listen time DTO
export const TrackListenTimeDto = z.object({
    seconds: z.number().int().nonnegative(),
});

export type TrackListenTimeDto = z.infer<typeof TrackListenTimeDto>;
