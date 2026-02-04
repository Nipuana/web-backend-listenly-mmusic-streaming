import z from "zod";
import { userInfoType } from "../types/userInfo.type";

export const UpdateUserInfoDto = userInfoType.partial().extend({
    dateOfBirth: z.string().or(z.date()).optional()
});

export type UpdateUserInfoDto = z.infer<typeof UpdateUserInfoDto>;
