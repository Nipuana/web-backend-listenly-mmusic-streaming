import z from "zod";
import { songType } from "../types/song.type";

// Create Song DTO
export const CreateSongDto = songType.pick({
    title: true,
    album: true,
    genre: true,
    duration: true,
    lyrics: true,
    isPublic: true,
}).extend({
    releaseDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
    audioUrl: z.string().optional(), // Optional since file will be uploaded
    coverImageUrl: z.string().optional(),
});

export type CreateSongDto = z.infer<typeof CreateSongDto>;

// Update Song DTO
export const UpdateSongDto = CreateSongDto.partial();
export type UpdateSongDto = z.infer<typeof UpdateSongDto>;

// Query Songs DTO
export const QuerySongsDto = z.object({
    genre: z.enum(['pop', 'rock', 'hip-hop', 'jazz', 'classical', 'electronic', 'r&b', 'country', 'other']).optional(),
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
