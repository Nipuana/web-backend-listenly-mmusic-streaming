import {Router, Request, Response} from 'express';
import { AdminUserController } from '../../controllers/admin/admin.controller';
import { authorizedMiddleware,adminMiddleware } from '../../middlewares/authorization.middleware'; 


const router :Router = Router();
const adminUserController = new AdminUserController();

router.post('/',authorizedMiddleware, adminMiddleware, adminUserController.createUser);

router.get('/test', authorizedMiddleware,adminMiddleware,(req:Request, res:Response) => {
    res.send('Admin User Route is working');
});

export default router;