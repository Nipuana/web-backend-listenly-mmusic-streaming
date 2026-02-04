import z from 'zod';

export const userInfoType = z.object({
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
    dateOfBirth: z.date().optional(),
    age: z.number().min(0).max(150).optional(),
    bio: z.string().max(500).optional(),
});

export type UserInfoType = z.infer<typeof userInfoType>;
