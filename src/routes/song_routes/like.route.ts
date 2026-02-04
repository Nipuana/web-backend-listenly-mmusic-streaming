import { Router } from "express";
import { LikeController } from "../../controllers/song_controllers/like.controller";
import { authorizedMiddleware } from "../../middlewares/authorization.middleware";

const router = Router();
const likeController = new LikeController();

// All routes require authentication
router.get('/user/liked-songs', authorizedMiddleware, likeController.getLikedSongs);
router.get('/like-status/:id/liked', authorizedMiddleware, likeController.checkIfLiked);
router.post('/change-like-status/:id', authorizedMiddleware, likeController.toggleLike);

export default router;
