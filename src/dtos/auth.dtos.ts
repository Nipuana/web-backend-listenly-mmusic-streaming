import z from "zod";
import  {userType} from "../types/auth.type";

// Register DTO
export const CreateUserDto = userType.pick({
    username: true,
    email: true,
    password: true
}).extend({
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long"),
    profilePicture: z.string().optional()
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Password and Confirm Password do not match",
        path: ["confirmPassword"]
    }
)
export type CreateUserDto = z.infer<typeof CreateUserDto>;



// Login DTO
export const LoginUserDto= z.object({
    email: z.email(),
    password: z.string().min(6)
});

export type LoginUserDto= z.infer<typeof LoginUserDto>;

export const UpdateUserDto= CreateUserDto.partial();
export type UpdateUserDto= z.infer<typeof UpdateUserDto>;