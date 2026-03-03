import {Router, Request, Response} from 'express';
import { AdminUserController } from '../../controllers/admin_controllers/admin.controller';
import { authorizedMiddleware,adminMiddleware } from '../../middlewares/authorization.middleware'; 


const router :Router = Router();
const adminUserController = new AdminUserController();


// Create user
router.post('/create-user', authorizedMiddleware, adminMiddleware, adminUserController.createUser);
// Get all users
router.get('/get-all-users', authorizedMiddleware,adminMiddleware, adminUserController.getAllUsers);
// Get user by id
router.get('/get-user/:id', authorizedMiddleware, adminUserController.getUserById);
// Update user
router.put('/update-user/:id', authorizedMiddleware, adminMiddleware, adminUserController.updateUser);
// Delete user
router.delete('/delete-user/:id', authorizedMiddleware, adminMiddleware, adminUserController.deleteUser);
// Clean orphaned likes
router.delete('/clean-orphaned-likes', authorizedMiddleware, adminMiddleware, adminUserController.cleanOrphanedLikes);

export default router;