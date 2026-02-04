import { UserInfoRepository } from "../../repositories/user_repositories/userInfo.repository";
import { UserRepository } from "../../repositories/user_repositories/auth.repository";
import { UpdateUserInfoDto } from "../../dtos/user_dtos/userInfo.dtos";
import { HttpError } from "../../errors/http-error";

let userInfoRepository = new UserInfoRepository();
let userRepository = new UserRepository();

export class UserInfoService {
    async updateUserInfo(userId: string, data: UpdateUserInfoDto) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        if (data.dateOfBirth && typeof data.dateOfBirth === 'string') {
            data.dateOfBirth = new Date(data.dateOfBirth);
        }

        const updatedUser = await userInfoRepository.updateUserInfo(userId, data as any);
        return updatedUser;
    }

    async getUserInfo(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        const additionalInfo = await userInfoRepository.getUserInfo(userId);
        return additionalInfo;
    }

    async clearUserInfo(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        const updatedUser = await userInfoRepository.clearUserInfo(userId);
        return updatedUser;
    }
}
