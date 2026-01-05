import { IUser, UserModel } from "../model/auth.model";

export interface IUserRepository{
    createUser(data: Partial<IUser>): Promise <IUser>;
    getUserByEmail(email:string): Promise<IUser | null>;
    getUserByUsername(username:string): Promise <IUser | null>;

    //Additional methods
    getUserById(id:string): Promise<IUser | null>;
    getAllUsers(): Promise<IUser[]>;
    updateUserById(id:string, data:Partial<IUser>): Promise<IUser | null>;
    deleteUserById(id:string): Promise<IUser | null>;
}

export class UserRepository implements IUserRepository{
    async createUser(data: Partial<IUser>): Promise<IUser> {
        const newUser=new UserModel(data);
        await newUser.save();
        return newUser;
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        const user = await UserModel.findOne({"email":email});
        return user;
    }

    async getUserByUsername(username: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ "username" : username });
        return user;
    }
    async getUserById(id: string): Promise<IUser | null> {
        const user = await UserModel.findById(id);
        return user;
    }
    async getAllUsers(): Promise<IUser[]> {
        const users = await UserModel.find();
        return users;
    }
    async updateUserById(id: string, data: Partial<IUser>): Promise<IUser | null> {
        const updatedUser = await UserModel.findByIdAndUpdate(id, data, { new: true });
        return updatedUser;
    }
    async deleteUserById(id: string): Promise<IUser | null> {
        const deletedUser = await UserModel.findByIdAndDelete(id);
        return deletedUser;
    }
}