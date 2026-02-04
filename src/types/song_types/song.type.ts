import z from 'zod';

export const songType = z.object({
    title: z.string().min(1, "Title is required"),
    album: z.string().optional(),
    genre: z.enum(['pop', 'rock', 'hip-hop', 'jazz', 'classical', 'electronic', 'r&b', 'country', 'other']).default('other'),
    duration: z.number().positive("Duration must be positive"),
    releaseDate: z.date().optional(),
    audioUrl: z.string().optional(),
    coverImageUrl: z.string().optional(),
    lyrics: z.string().optional(),
    playCount: z.number().int().nonnegative().default(0),
    likeCount: z.number().int().nonnegative().default(0),
    listenTimeSeconds: z.number().int().nonnegative().default(0),
    isPublic: z.boolean().default(true),
    uploadedBy: z.string(), 
});

export type SongType = z.infer<typeof songType>;
