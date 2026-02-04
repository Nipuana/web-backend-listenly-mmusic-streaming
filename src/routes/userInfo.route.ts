import { Router } from "express";
import { UserInfoController } from "../controllers/userInfo.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const userInfoController = new UserInfoController();

router.put('/additional-info', authorizedMiddleware, userInfoController.updateAdditionalInfo);
router.get('/additional-info', authorizedMiddleware, userInfoController.getAdditionalInfo);
router.delete('/additional-info', authorizedMiddleware, userInfoController.clearAdditionalInfo);

export default router;
