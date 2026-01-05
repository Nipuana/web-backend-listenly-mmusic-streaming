import { UserRepository } from "../../repositories/auth.repository";
import z from "zod";
import { CreateUserDto } from "../../dtos/auth.dtos";
import { Request, Response } from "express";
let userRepository = new UserRepository();

export class AdminUserService {
    async createUser(data: CreateUserDto) {
        //logic to create userby admin, same as auth service register user
        // Can add additional admin-specific logic here if needed
        const emailExists = await userRepository.getUserByEmail(data.email);
        if (emailExists) {
            throw new Error("Email already registered");
        }
        const usernameExists = await userRepository.getUserByUsername(data.username);
        if (usernameExists) {
            throw new Error("Username already exists");
        }
    }
    async getAllUsers() {

        //logic to get all users
        const users = await userRepository.getAllUsers();
        // transform data if needed
        return users;
    }
    async getUserById(userId: string) {
        //logic to get user by id
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
}