import { UserRepository } from "../../repositories/user_repositories/auth.repository";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../../dtos/user_dtos/auth.dtos";
import bcrypt from 'bcryptjs';
import { HttpError } from "../../errors/http-error";
import { JWT_SECRET } from "../../config/db_config";
import jwt from 'jsonwebtoken';
import { sendEmail } from "../../config/req_email_config/email";

const CLIENT_URL = process.env.CLIENT_URL as string;
const MOBILE_CLIENT_URL = (process.env.MOBILE_CLIENT_URL as string) || 'weplay://reset-password';

function buildResetLink(baseUrl: string, token: string) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}token=${token}`;
}


let userRepository=new UserRepository
export class AuthService{
    async registerUser(data : CreateUserDto){
        //logic to register user, duplicate check, hash
        const emailExists= await userRepository.getUserByEmail(data.email);
        if(emailExists){
            throw new HttpError(409,"Email already registered");
        }
        const usernameExists= await userRepository.getUserByUsername(data.username);
        if(usernameExists){
            throw new HttpError(409,"Username already exists");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(data.password, 10);//10-complexity
        data.password=hashedPassword; // replace plain text with hashed password
        
        const newUser= await userRepository.createUser(data);
        return newUser;
    }

    async loginUser(data: LoginUserDto){
        const user = await userRepository.getUserByEmail(data.email);
        if(!user){
            throw new HttpError(404,"User not found");
        }
        const validPassword =  await bcrypt.compare(data.password,user.password)
        if(!validPassword){
            throw new HttpError(401, "Invalid password");
        }
        // Generate JWT token
       const payload = {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
       };
       const token =  jwt.sign(payload, JWT_SECRET, {expiresIn:'30d'});
       return {token, user};
    }
    async getUserById(userId:string){
        if (!userId){
            throw new HttpError(400, "User ID is required");
        }
        const user =await userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        return user;
    }

async updateUser(userId: string, data: UpdateUserDto){
        const user = await userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        if(data.email && user.email !== data.email){
            const emailExists = await userRepository.getUserByEmail(data.email);
            if(emailExists){
                throw new HttpError(409, "Email already exists");
            }
        }
        if(data.username && user.username !== data.username){
            const usernameExists = await userRepository.getUserByUsername(data.username);
            if(usernameExists){
                throw new HttpError(409, "Username already exists");
            }
        }
        if(data.password){
            const hashedPassword = await bcrypt.hash(data.password, 10);
            data.password = hashedPassword;
        }
        const updatedUser = await userRepository.updateUserById(userId, data);
        return updatedUser;
    }
async sendResetPasswordEmail(email?: string, publicApiBaseUrl?: string) {
        if (!email) {
            throw new HttpError(400, "Email is required");
        }
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' }); // 1 hour expiry
        const webResetLink = buildResetLink(`${CLIENT_URL}/reset-password`, token);
        const mobileDeepLink = buildResetLink(MOBILE_CLIENT_URL, token);
        const mobileResetLink = buildResetLink(
            `${publicApiBaseUrl || CLIENT_URL}/api/auth/mobile-reset-link`,
            token,
        );
        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
                <h2 style="margin-bottom: 12px;">Reset your password</h2>
                <p style="margin-bottom: 16px;">Choose where you want to continue resetting your password.</p>
                <div style="margin-bottom: 16px;">
                    <a href="${mobileResetLink}" style="display: inline-block; padding: 12px 18px; margin-right: 12px; background: #0f766e; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
                        Open in Mobile App
                    </a>
                    <a href="${webResetLink}" style="display: inline-block; padding: 12px 18px; background: #1d4ed8; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
                        Open in Web App
                    </a>
                </div>
                <p style="margin-bottom: 8px;">If the mobile button does not open the app automatically, the page will also show an app-open fallback.</p>
                <p style="font-size: 13px; color: #6b7280;">This link will expire in 1 hour.</p>
                <p style="font-size: 13px; color: #6b7280;">Mobile deep link: ${mobileDeepLink}</p>
            </div>
        `;
        await sendEmail(user.email, "Password Reset", html);
        return user;

    }

    getMobileResetRedirectPage(token?: string) {
        if (!token) {
            throw new HttpError(400, "Token is required");
        }

        const mobileDeepLink = buildResetLink(MOBILE_CLIENT_URL, token);
        const webResetLink = buildResetLink(`${CLIENT_URL}/reset-password`, token);

        return `
            <!doctype html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Open Weplay Reset</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: #f4f7fb;
                        color: #1f2937;
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0;
                        padding: 24px;
                    }
                    .card {
                        max-width: 480px;
                        width: 100%;
                        background: white;
                        border-radius: 18px;
                        padding: 28px;
                        box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
                    }
                    .actions {
                        display: flex;
                        gap: 12px;
                        flex-wrap: wrap;
                        margin-top: 20px;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 18px;
                        border-radius: 10px;
                        text-decoration: none;
                        font-weight: 600;
                    }
                    .primary {
                        background: #0f766e;
                        color: #fff;
                    }
                    .secondary {
                        background: #e5e7eb;
                        color: #111827;
                    }
                    .muted {
                        margin-top: 16px;
                        font-size: 14px;
                        color: #6b7280;
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>Open Weplay to reset your password</h2>
                    <p>We are trying to open the mobile app with your reset token.</p>
                    <div class="actions">
                        <a class="button primary" href="${mobileDeepLink}">Open in Mobile App</a>
                        <a class="button secondary" href="${webResetLink}">Open in Web App</a>
                    </div>
                    <p class="muted">If the app does not open automatically, tap the mobile button above.</p>
                </div>
                <script>
                    window.setTimeout(function () {
                        window.location.href = ${JSON.stringify(mobileDeepLink)};
                    }, 150);
                </script>
            </body>
            </html>
        `;
    }

    async resetPassword(token?: string, newPassword?: string) {
        try {
            if (!token || !newPassword) {
                throw new HttpError(400, "Token and new password are required");
            }
            const decoded: any = jwt.verify(token, JWT_SECRET);
            const userId = decoded.id;
            const user = await userRepository.getUserById(userId);
            if (!user) {
                throw new HttpError(404, "User not found");
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await userRepository.updateUserById(userId, { password: hashedPassword });
            return user;
        } catch (error) {
            throw new HttpError(400, "Invalid or expired token");
        }
    }
}