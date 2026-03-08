import { Router } from "express";
import {  AuthController } from "../../controllers/user_controllers/auth.controller";
import { authorizedMiddleware } from "../../middlewares/authorization.middleware";
import { uploads } from "../../middlewares/upload.middleware";
const router=Router();
const authController=new AuthController();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

router.get('/profile',authorizedMiddleware, authController.getUserById);

router.put('/update-profile',authorizedMiddleware,uploads.single('profilePicture'),authController.updateUser);
router.post("/request-password-reset", authController.sendResetPasswordEmail);
router.get("/mobile-reset-link", authController.mobileResetLink);
router.post("/reset-password/:token", authController.resetPassword);

export default router;