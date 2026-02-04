import { UserInfoRepository } from "../repositories/userInfo.repository";
import { UserRepository } from "../repositories/auth.repository";
import { UpdateUserInfoDto } from "../dtos/userInfo.dtos";
import { HttpError } from "../errors/http-error";

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
        
        // Auto-calculate age if dateOfBirth is provided
        if (updatedUser?.additionalInfo?.dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(updatedUser.additionalInfo.dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            // Update age in the database
            await userInfoRepository.updateUserInfo(userId, { age } as any);
            if (updatedUser.additionalInfo) {
                updatedUser.additionalInfo.age = age;
            }
        }
        
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
