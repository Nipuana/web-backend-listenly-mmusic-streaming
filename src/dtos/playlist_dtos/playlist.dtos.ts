import z from "zod";
import { playlistType } from "../../types/playlist_types/playlist.type";

// Create Playlist DTO
export const CreatePlaylistDto = playlistType.pick({
    name: true,
    description: true,
    coverImageUrl: true,
    visibility: true,
});

export type CreatePlaylistDto = z.infer<typeof CreatePlaylistDto>;

// Update Playlist DTO
export const UpdatePlaylistDto = CreatePlaylistDto.partial();
export type UpdatePlaylistDto = z.infer<typeof UpdatePlaylistDto>;

// Add Song to Playlist DTO
export const AddSongToPlaylistDto = z.object({
    songId: z.string().min(1, "Song ID is required"),
    position: z.number().int().min(0).optional(), // Auto-assign if not provided
});

export type AddSongToPlaylistDto = z.infer<typeof AddSongToPlaylistDto>;

// Reorder Songs DTO
export const ReorderSongsDto = z.object({
    songOrders: z.array(z.object({
        songId: z.string(),
        position: z.number().int().min(0)
    })).min(1, "At least one song order required"),
});

export type ReorderSongsDto = z.infer<typeof ReorderSongsDto>;

// Query Playlists DTO
export const QueryPlaylistsDto = z.object({
    search: z.string().optional(),
    sortBy: z.enum(['name', 'createdAt', 'favoriteCount']).optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    limit: z.number().int().positive().optional().default(20),
    page: z.number().int().positive().optional().default(1),
});

export type QueryPlaylistsDto = z.infer<typeof QueryPlaylistsDto>;
