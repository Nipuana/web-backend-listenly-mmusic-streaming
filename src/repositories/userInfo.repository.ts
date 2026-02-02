import { IUser, UserModel } from "../models/auth.model";
import { UserInfoType } from "../types/userInfo.type";

export interface IUserInfoRepository {
    updateUserInfo(userId: string, additionalInfo: UserInfoType): Promise<IUser | null>;
    getUserInfo(userId: string): Promise<UserInfoType | null>;
    clearUserInfo(userId: string): Promise<IUser | null>;
}

export class UserInfoRepository implements IUserInfoRepository {
    async updateUserInfo(userId: string, additionalInfo: UserInfoType): Promise<IUser | null> {
        // Get current user to merge with existing additionalInfo
        const currentUser = await UserModel.findById(userId);
        const merged = {
            ...currentUser?.additionalInfo,
            ...additionalInfo
        };
        
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $set: { additionalInfo: merged } },
            { new: true, runValidators: true }
        ).select('-password');
        return updatedUser;
    }

    async getUserInfo(userId: string): Promise<UserInfoType | null> {
        const user = await UserModel.findById(userId).select('additionalInfo');
        return user?.additionalInfo || null;
    }

    async clearUserInfo(userId: string): Promise<IUser | null> {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $unset: { additionalInfo: "" } },
            { new: true }
        ).select('-password');
        return updatedUser;
    }
}
