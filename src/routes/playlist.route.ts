import { Router } from "express";
import { PlaylistController } from "../controllers/playlist.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";
import { uploads } from "../middlewares/upload.middleware";

const router = Router();
const playlistController = new PlaylistController();

// All routes require authentication
router.get('/', authorizedMiddleware, playlistController.getAllPlaylists);
router.get('/user/my-playlists', authorizedMiddleware, playlistController.getMyPlaylists);
router.get('/user/favorited', authorizedMiddleware, playlistController.getFavoritedPlaylists);
router.get('/:id', authorizedMiddleware, playlistController.getPlaylistById);
router.get('/:id/favorited', authorizedMiddleware, playlistController.checkIfFavorited);

// Create, update, delete routes (require authentication + ownership)
router.post('/', authorizedMiddleware, uploads.single('playlistCover'), playlistController.createPlaylist);
router.put('/:id', authorizedMiddleware, uploads.single('playlistCover'), playlistController.updatePlaylist);
router.delete('/:id', authorizedMiddleware, playlistController.deletePlaylist);

// Song management in playlists
router.post('/:id/songs', authorizedMiddleware, playlistController.addSongToPlaylist);
router.delete('/:id/songs/:songId', authorizedMiddleware, playlistController.removeSongFromPlaylist);
router.put('/:id/songs/reorder', authorizedMiddleware, playlistController.reorderSongsInPlaylist);

// Favorite management
router.post('/:id/favorite', authorizedMiddleware, playlistController.toggleFavorite);

export default router;
