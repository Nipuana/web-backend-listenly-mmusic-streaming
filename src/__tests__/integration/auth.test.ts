import request from 'supertest';
import app from "../../app";
import { UserModel } from '../../models/user_models/auth.model';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/db_config';

jest.mock('../../config/email', () => ({
    sendEmail: jest.fn().mockResolvedValue(undefined),
}));

describe(
    "Auhentication Integration Tests", 
    () => { //what to do in test
        const testUser = {
            email: "testuser11@example.com",
            username: "testuser11",
            password: "Test@1234",
            confirmPassword: "Test@1234",
            role: "user",
        }
        const testUserDuplicateEmail = {
            email: "testuser11@example.com",
            username: "testuser11_dup",
            password: "Test@1234",
            confirmPassword: "Test@1234",
            role: "user",
        }
        const testUserDuplicateUsername = {
            email: "testuser11_new@example.com",
            username: "testuser11",
            password: "Test@1234",
            confirmPassword: "Test@1234",
            role: "user",
        }
        let authToken = "";
        let userId = "";
        let currentEmail = testUser.email;
        let currentUsername = testUser.username;
        beforeAll(async () => {
            // Clean up test users if exists
            await UserModel.deleteOne({ email: testUser.email });
            await UserModel.deleteOne({ email: testUserDuplicateUsername.email });
            await UserModel.deleteOne({ email: "testuser11_updated@example.com" });
        });
        afterAll(async () => {
            // Clean up test users after tests
            await UserModel.deleteOne({ email: testUser.email });
            await UserModel.deleteOne({ email: testUserDuplicateUsername.email });
            await UserModel.deleteOne({ email: "testuser11_updated@example.com" });
        });

        describe(
            "POST /api/auth/register", // nested test suite/group
            () => {
                test(
                    "should register a new user", // name of individual test
                    async () => { // what to do in test
                        const response = await request(app)
                            .post("/api/auth/register")
                            .send(testUser)
                        
                        expect(response.status).toBe(201);
                        expect(response.body).toHaveProperty(
                            "message", 
                            " Registered Successfully"
                        );
                    }
                )
            }
        )
        describe(
            "POST /api/auth/register (duplicate email)",
            () => {
                test(
                    "should reject duplicate email",
                    async () => {
                        const response = await request(app)
                            .post("/api/auth/register")
                            .send(testUserDuplicateEmail)

                        expect(response.status).toBe(409);
                        expect(response.body).toHaveProperty(
                            "message",
                            "Email already registered"
                        );
                    }
                )
            }
        )
        describe(
            "POST /api/auth/register (duplicate username)",
            () => {
                test(
                    "should reject duplicate username",
                    async () => {
                        const response = await request(app)
                            .post("/api/auth/register")
                            .send(testUserDuplicateUsername)

                        expect(response.status).toBe(409);
                        expect(response.body).toHaveProperty(
                            "message",
                            "Username already exists"
                        );
                    }
                )
            }
        )
        const testUser2 = {
            email: testUser.email,
            password: testUser.password,
        }
        describe(
            "POST /api/auth/login", // nested test suite/group
            () => {
                test(
                    "should login a user", // name of individual test
                    async () => { // what to do in test
                        const response = await request(app)
                            .post("/api/auth/login")
                            .send(testUser2)
                        
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty(
                            "message", 
                            "Login Successful"
                        );
                        expect(response.body).toHaveProperty("token");
                        expect(response.body).toHaveProperty("data");
                        authToken = response.body.token;
                        userId = response.body.data?._id;
                    }
                )
            }
        )
        describe(
            "GET /api/auth/profile",
            () => {
                test(
                    "should fetch user profile",
                    async () => {
                        const response = await request(app)
                            .get("/api/auth/profile")
                            .set("Authorization", `Bearer ${authToken}`);

                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty(
                            "message",
                            "Profile fetched successfully"
                        );
                        expect(response.body).toHaveProperty("data");
                        expect(response.body.data).toHaveProperty("email", currentEmail);
                    }
                )
            }
        )
        describe(
            "PUT /api/auth/update-profile",
            () => {
                test(
                    "should update user profile",
                    async () => {
                        const updatePayload = {
                            email: "testuser11_updated@example.com",
                            username: "testuser11_updated",
                            role: "user",
                        };

                        const response = await request(app)
                            .put("/api/auth/update-profile")
                            .set("Authorization", `Bearer ${authToken}`)
                            .send(updatePayload);

                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty(
                            "message",
                            "User updated successfully"
                        );
                        expect(response.body).toHaveProperty("data");
                        currentEmail = updatePayload.email;
                        currentUsername = updatePayload.username;
                    }
                )
            }
        )
        describe(
            "POST /api/auth/request-password-reset",
            () => {
                test(
                    "should request a password reset",
                    async () => {
                        const response = await request(app)
                            .post("/api/auth/request-password-reset")
                            .send({ email: currentEmail });

                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty(
                            "message",
                            "If the email is registered, a reset link has been sent."
                        );
                    }
                )
            }
        )
        describe(
            "POST /api/auth/reset-password/:token",
            () => {
                test(
                    "should reset password",
                    async () => {
                        const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
                        const response = await request(app)
                            .post(`/api/auth/reset-password/${token}`)
                            .send({ newPassword: "NewPass@123" });

                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty(
                            "message",
                            "Password has been reset successfully."
                        );
                    }
                )
            }
        )
        describe(
            "POST /api/auth/login (after reset)",
            () => {
                test(
                    "should login with new password",
                    async () => {
                        const response = await request(app)
                            .post("/api/auth/login")
                            .send({ email: currentEmail, password: "NewPass@123" });

                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty(
                            "message",
                            "Login Successful"
                        );
                        expect(response.body).toHaveProperty("token");
                        expect(response.body).toHaveProperty("data");
                        expect(response.body.data).toHaveProperty("username", currentUsername);
                    }
                )
            }
        )
    }
)