import { Router } from "express";
import { SongController } from "../../controllers/song_controllers/song.controller";
import { authorizedMiddleware } from "../../middlewares/authorization.middleware";
import { songUploads } from "../../middlewares/upload.middleware";

const router = Router();
const songController = new SongController();
// All routes require authentication
router.get('/get-all-songs', authorizedMiddleware, songController.getAllSongs);
router.get('/user/my-songs', authorizedMiddleware, songController.getMySongs);
router.get('/getSongByuserId/:userId', authorizedMiddleware, songController.getSongsByUserId);
router.get('/getSongsBygenre/:genre', authorizedMiddleware, songController.getSongsByGenre);
router.get('/getSongById/:id', authorizedMiddleware, songController.getSongById);
router.post('/play-count/:id', authorizedMiddleware, songController.incrementPlayCount);
router.post('/listen-time/:id', authorizedMiddleware, songController.addListenTime);

// Create, update, delete routes (require authentication + ownership)
router.post('/create-song', 
    authorizedMiddleware, 
    songUploads.fields(),
    songController.createSong
);
router.put('/update-song/:id', 
    authorizedMiddleware,
    songUploads.fields(),
    songController.updateSong
);
router.delete('/del-song/:id', authorizedMiddleware, songController.deleteSong);

export default router;
