import z from 'zod';

export const userType=z.object({
    email:z.email(),
    username:z.string().min(3),
    password:z.string().min(6),
    role : z.enum(['user','artist','admin','pUser']).default('user'), // pUser = premium user
    profilePicture: z.string().optional()
});

export type UserType=z.infer<typeof userType>;