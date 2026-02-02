import { Router } from "express";
import { UserInfoController } from "../controllers/userInfo.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const userInfoController = new UserInfoController();

router.put('/add-info', authorizedMiddleware, userInfoController.updateAdditionalInfo);
router.get('/get-info', authorizedMiddleware, userInfoController.getAdditionalInfo);
router.delete('/clear-info', authorizedMiddleware, userInfoController.clearAdditionalInfo);

export default router;
