import z from "zod";

export const CreateArtistVerificationRequestDto = z
    .object({
        message: z.string().trim().min(10).max(2000),
    });

export type CreateArtistVerificationRequestDto = z.infer<typeof CreateArtistVerificationRequestDto>;

export const AdminReviewArtistVerificationRequestDto = z.object({
    adminNote: z.string().trim().max(2000).optional(),
});

export type AdminReviewArtistVerificationRequestDto = z.infer<typeof AdminReviewArtistVerificationRequestDto>;
