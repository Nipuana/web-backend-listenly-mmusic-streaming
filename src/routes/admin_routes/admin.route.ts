import {Router, Request, Response} from 'express';
import { AdminUserController } from '../../controllers/admin_controllers/admin.controller';
import { authorizedMiddleware,adminMiddleware } from '../../middlewares/authorization.middleware'; 
import { auditAdminAction } from '../../middlewares/admin-audit.middleware';
import { AdminAuditLogController } from '../../controllers/admin_controllers/adminAuditLog.controller';


const router :Router = Router();
const adminUserController = new AdminUserController();
const adminAuditLogController = new AdminAuditLogController();


// Create user
router.post('/create-user', authorizedMiddleware, adminMiddleware, auditAdminAction('ADMIN_CREATE_USER'), adminUserController.createUser);
// Get all users
router.get('/get-all-users', authorizedMiddleware,adminMiddleware, auditAdminAction('ADMIN_GET_ALL_USERS'), adminUserController.getAllUsers);
// Get user by id
router.get('/get-user/:id', authorizedMiddleware, auditAdminAction('ADMIN_GET_USER'), adminUserController.getUserById);
// Update user
router.put('/update-user/:id', authorizedMiddleware, adminMiddleware, auditAdminAction('ADMIN_UPDATE_USER'), adminUserController.updateUser);
// Delete user
router.delete('/delete-user/:id', authorizedMiddleware, adminMiddleware, auditAdminAction('ADMIN_DELETE_USER'), adminUserController.deleteUser);
// Clean orphaned likes
router.delete('/clean-orphaned-likes', authorizedMiddleware, adminMiddleware, auditAdminAction('ADMIN_CLEAN_ORPHANED_LIKES'), adminUserController.cleanOrphanedLikes);
// Clean orphaned favorites
router.delete('/clean-orphaned-favorites', authorizedMiddleware, adminMiddleware, auditAdminAction('ADMIN_CLEAN_ORPHANED_FAVORITES'), adminUserController.cleanOrphanedFavorites);

// Audit logs (READ ONLY)
router.get('/audit-logs', authorizedMiddleware, adminMiddleware, auditAdminAction('ADMIN_LIST_AUDIT_LOGS'), adminAuditLogController.list);
router.get('/audit-logs/:id', authorizedMiddleware, adminMiddleware, auditAdminAction('ADMIN_GET_AUDIT_LOG'), adminAuditLogController.getById);
// Clean orphaned favorites
router.delete('/clean-orphaned-favorites', authorizedMiddleware, adminMiddleware, adminUserController.cleanOrphanedFavorites);

export default router;