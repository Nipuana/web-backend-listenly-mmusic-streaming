import { Router } from "express";
import { authorizedMiddleware } from "../../middlewares/authorization.middleware";
import { ArtistVerificationRequestController } from "../../controllers/user_controllers/artistVerificationRequest.controller";

const router = Router();
const controller = new ArtistVerificationRequestController();

router.post("/request", authorizedMiddleware, controller.submit);
router.get("/my-request", authorizedMiddleware, controller.myLatest);

export default router;
