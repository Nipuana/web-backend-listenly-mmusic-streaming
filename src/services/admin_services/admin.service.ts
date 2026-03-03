import { UserRepository } from "../../repositories/user_repositories/auth.repository";
import { CreateUserDto } from "../../dtos/user_dtos/auth.dtos";
let userRepository = new UserRepository();

export class AdminUserService {
    async createUser(data: CreateUserDto) {
        const emailExists = await userRepository.getUserByEmail(data.email);
        if (emailExists) {
            throw new Error("Email already registered");
        }
        const usernameExists = await userRepository.getUserByUsername(data.username);
        if (usernameExists) {
            throw new Error("Username already exists");
        }
        // Hash password if not already hashed
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(data.password, 10);
        data.password = hashedPassword;
        const newUser = await userRepository.createUser(data);
        return newUser;
    }

    async getAllUsers() {
        const users = await userRepository.getAllUsers();
        return users.map(user => {
            const { password, ...userWithoutPassword } = user.toObject ? user.toObject() : user;
            return userWithoutPassword;
        });
    }

    async getUserById(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const { password, ...userWithoutPassword } = user.toObject ? user.toObject() : user;
        return userWithoutPassword;
    }

    async updateUser(userId: string, data: any) {
        if (data.password) {
            const bcrypt = require('bcryptjs');
            data.password = await bcrypt.hash(data.password, 10);
        }
        const updatedUser = await userRepository.updateUserById(userId, data);
        if (!updatedUser) {
            throw new Error("User not found");
        }
        return updatedUser;
    }

    async deleteUser(userId: string) {
        const deletedUser = await userRepository.deleteUserById(userId);
        if (!deletedUser) {
            throw new Error("User not found");
        }
        return deletedUser;
    }
}