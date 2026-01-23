import { Router } from "express";
import {  AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";
import { uploads } from "../middlewares/upload.middleware";
const router=Router();
const authController=new AuthController();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

router.get('/profile',authorizedMiddleware, authController.getUserById);

router.put(
    '/update-profile',
    authorizedMiddleware,
    uploads.single('profilePicture'),
    authController.updateUser
)

export default router;