import z from 'zod';
export const userType=z.object({
    firstName:z.string().optional(),
    lastName:z.string().optional(),
    email:z.email(),
    username:z.string().min(3),
    password:z.string().min(6),
    role : z.enum(['user','admin']).default('user')
});

export type UserType=z.infer<typeof userType>;