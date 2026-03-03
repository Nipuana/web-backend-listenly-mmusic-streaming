import { Router } from "express";
import { PlaylistController } from "../../controllers/playlist_controllers/playlist.controller";
import { authorizedMiddleware } from "../../middlewares/authorization.middleware";
import { uploads } from "../../middlewares/upload.middleware";

const router = Router();
const playlistController = new PlaylistController();

// All routes require authentication
router.get('/get-all', authorizedMiddleware, playlistController.getAllPlaylists);
router.get('/user/my-playlists', authorizedMiddleware, playlistController.getMyPlaylists);
router.get('/getPlaylistById/:id', authorizedMiddleware, playlistController.getPlaylistById);

// Create, update, delete routes (require authentication + ownership)
router.post('/create-playlist', authorizedMiddleware, uploads.single('playlistCover'), playlistController.createPlaylist);
router.put('/update-playlist/:id', authorizedMiddleware, uploads.single('playlistCover'), playlistController.updatePlaylist);
router.delete('/delete-playlist/:id', authorizedMiddleware, playlistController.deletePlaylist);

// Song management in playlists
router.post('/:id/songs', authorizedMiddleware, playlistController.addSongToPlaylist);
router.delete('/remove-song-from-playlist/:id/:songId', authorizedMiddleware, playlistController.removeSongFromPlaylist);
router.put('/reorder-songs/:id', authorizedMiddleware, playlistController.reorderSongsInPlaylist);

export default router;
