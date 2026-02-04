import request from 'supertest';
import app from "../../app";
import { UserModel } from '../../models/auth.model';

describe(
    "Auhentication Integration Tests", //name of test suite group
    () => { //what to do in test
        const testUser = {
            fullName:"Test user",
            email: "testuser11@example.com",
            phoneNumber: 9821456764,
            username: "testuser11",
            password: "Test@1234",
            confirmPassword: "Test@1234",
           
        }
        beforeAll(async () => {
            // Clean up test user if exists
            await UserModel.deleteOne({ email: testUser.email });
        });
        afterAll(async () => {
            // Clean up test user after tests
            await UserModel.deleteOne({ email: testUser.email });
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
                            "Registered successfully."
                        );
                    }
                )
            }
        )
        const testUser2 = {
            email: "muskan@gmail.com",
            password: "password",
        }
        describe(
            "POST /api/auth/login", // nested test suite/group
            () => {
                test(
                    "should register a new user", // name of individual test
                    async () => { // what to do in test
                        const response = await request(app)
                            .post("/api/auth/login")
                            .send(testUser2)
                        
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty(
                            "message", 
                            "Login Successful"
                        );
                    }
                )
            }
        )
    }
)