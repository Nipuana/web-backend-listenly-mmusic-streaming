import {Router, Request, Response} from 'express';
import { AdminUserController } from '../../controllers/admin_controllers/admin.controller';
import { authorizedMiddleware,adminMiddleware } from '../../middlewares/authorization.middleware'; 


const router :Router = Router();
const adminUserController = new AdminUserController();


// Create user
router.post('/create-user', authorizedMiddleware, adminMiddleware, adminUserController.createUser.bind(adminUserController));
// Get all users
router.get('/get-all-users', authorizedMiddleware, adminMiddleware, adminUserController.getAllUsers.bind(adminUserController));
// Get user by id
router.get('/get-user/:id', authorizedMiddleware, adminMiddleware, adminUserController.getUserById.bind(adminUserController));
// Update user
router.put('/update-user/:id', authorizedMiddleware, adminMiddleware, adminUserController.updateUser.bind(adminUserController));
// Delete user
router.delete('/delete-user/:id', authorizedMiddleware, adminMiddleware, adminUserController.deleteUser.bind(adminUserController));

export default router;