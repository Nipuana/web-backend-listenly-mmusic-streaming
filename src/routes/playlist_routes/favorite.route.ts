import { Router } from "express";
import { PlaylistController } from "../../controllers/playlist_controllers/playlist.controller";
import { authorizedMiddleware } from "../../middlewares/authorization.middleware";

const router = Router();
const playlistController = new PlaylistController();

// Favorite management
router.get('/user/favorited', authorizedMiddleware, playlistController.getFavoritedPlaylists);
router.get('/:id/favorited', authorizedMiddleware, playlistController.checkIfFavorited);
router.post('/:id/favorite', authorizedMiddleware, playlistController.toggleFavorite);

export default router;
