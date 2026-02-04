import z from 'zod';

export const playlistType = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    description: z.string().max(500, "Description too long").optional(),
    coverImageUrl: z.string().optional(),
    isPublic: z.boolean().default(true),
    createdBy: z.string(), // User ID reference
    songs: z.array(z.object({
        songId: z.string(),
        position: z.number().int().min(0)
    })).default([]),
    favoriteCount: z.number().int().nonnegative().default(0),
});

export type PlaylistType = z.infer<typeof playlistType>;
