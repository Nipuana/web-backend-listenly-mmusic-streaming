import { Router } from "express";
import { SongController } from "../../controllers/song_controllers/song.controller";
import { LikeController } from "../../controllers/song_controllers/like.controller";
import { authorizedMiddleware } from "../../middlewares/authorization.middleware";
import { songUploads } from "../../middlewares/upload.middleware";

const router = Router();
const songController = new SongController();
const likeController = new LikeController();

// All routes require authentication
router.get('/get-all-songs', authorizedMiddleware, songController.getAllSongs);
router.get('/user/my-songs', authorizedMiddleware, songController.getMySongs);
router.get('/user/liked-songs', authorizedMiddleware, likeController.getLikedSongs);
router.get('/getSongByuserId/:userId', authorizedMiddleware, songController.getSongsByUserId);
router.get('/getSongsBygenre/:genre', authorizedMiddleware, songController.getSongsByGenre);
router.get('/getSongById/:id', authorizedMiddleware, songController.getSongById);
router.get('/like-status/:id/liked', authorizedMiddleware, likeController.checkIfLiked);
router.post('/play-count/:id', authorizedMiddleware, songController.incrementPlayCount);
router.post('/listen-time/:id', authorizedMiddleware, songController.addListenTime);
router.post('/change-like-status/:id', authorizedMiddleware, likeController.toggleLike);

// Create, update, delete routes (require authentication + ownership)
router.post('/create-song', 
    authorizedMiddleware, 
    songUploads.fields(),
    songController.createSong
);
router.get('/user/my-songs', authorizedMiddleware, songController.getMySongs);
router.put('/update-song/:id', 
    authorizedMiddleware,
    songUploads.fields(),
    songController.updateSong
);
router.delete('/del-song/:id', authorizedMiddleware, songController.deleteSong);

export default router;
