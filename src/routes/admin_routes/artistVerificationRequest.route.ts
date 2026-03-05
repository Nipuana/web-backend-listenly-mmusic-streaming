import { Router } from "express";
import {
    authorizedMiddleware,
    adminMiddleware,
} from "../../middlewares/authorization.middleware";
import { auditAdminAction } from "../../middlewares/admin-audit.middleware";
import { AdminArtistVerificationRequestController } from "../../controllers/admin_controllers/artistVerificationRequest.controller";

const router = Router();
const controller = new AdminArtistVerificationRequestController();

router.get("/requests", authorizedMiddleware, adminMiddleware, auditAdminAction('ADMIN_LIST_ARTIST_VERIFICATION_REQUESTS'), controller.list);
router.patch("/requests/:id/approve", authorizedMiddleware, adminMiddleware, auditAdminAction('ADMIN_APPROVE_ARTIST_VERIFICATION_REQUEST'), controller.approve);
router.patch("/requests/:id/decline", authorizedMiddleware, adminMiddleware, auditAdminAction('ADMIN_DECLINE_ARTIST_VERIFICATION_REQUEST'), controller.decline);

export default router;
