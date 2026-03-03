import { PlaylistService } from "../../services/playlist_services/playlist.service";
import { CreatePlaylistDto, UpdatePlaylistDto, QueryPlaylistsDto, AddSongToPlaylistDto, ReorderSongsDto } from "../../dtos/playlist_dtos/playlist.dtos";
import z from "zod";
import { Request, Response } from "express";

const playlistService = new PlaylistService();

export class PlaylistController {
    // Create a new playlist
    async createPlaylist(req: Request, res: Response) {
        try {
            const parsedData = CreatePlaylistDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }

            // Handle cover image upload
            if (req.file) {
                parsedData.data.coverImageUrl = `/uploads/images/playlist_img/${req.file.filename}`;
            } else {
                parsedData.data.coverImageUrl = '/uploads/defaults/playlist_default.png';
            }

            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const newPlaylist = await playlistService.createPlaylist(parsedData.data, userId);
            return res.status(201).json({
                success: true,
                data: newPlaylist,
                message: "Playlist created successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Get all playlists (public only)
    async getAllPlaylists(req: Request, res: Response) {
        try {
            const queryData = {
                search: req.query.search as string,
                sortBy: req.query.sortBy as string,
                order: req.query.order as string,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                page: req.query.page ? parseInt(req.query.page as string) : undefined,
            };

            const parsedQuery = QueryPlaylistsDto.safeParse(queryData);
            if (!parsedQuery.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedQuery.error)
                });
            }

            const playlists = await playlistService.getAllPlaylists(parsedQuery.data);
            return res.status(200).json({
                success: true,
                data: playlists,
                count: playlists.length,
                message: "Playlists retrieved successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Get playlist by ID
    async getPlaylistById(req: Request, res: Response) {
        try {
            const playlistId = req.params.id;
            const userId = req.user?._id;

            const playlist = await playlistService.getPlaylistById(playlistId, userId);
            return res.status(200).json({
                success: true,
                data: playlist,
                message: "Playlist retrieved successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Get current user's playlists
    async getMyPlaylists(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const playlists = await playlistService.getMyPlaylists(userId);
            return res.status(200).json({
                success: true,
                data: playlists,
                count: playlists.length,
                message: "Your playlists retrieved successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Update playlist
    async updatePlaylist(req: Request, res: Response) {
        try {
            const playlistId = req.params.id;
            const parsedData = UpdatePlaylistDto.safeParse(req.body);

            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }

            // Handle cover image upload
            if (req.file) {
                parsedData.data.coverImageUrl = `/uploads/images/playlist_img/${req.file.filename}`;
            }

            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const updatedPlaylist = await playlistService.updatePlaylist(playlistId, parsedData.data, userId);
            return res.status(200).json({
                success: true,
                data: updatedPlaylist,
                message: "Playlist updated successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Delete playlist
    async deletePlaylist(req: Request, res: Response) {
        try {
            const playlistId = req.params.id;
            const userId = req.user?._id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const deletedPlaylist = await playlistService.deletePlaylist(playlistId, userId);
            return res.status(200).json({
                success: true,
                data: deletedPlaylist,
                message: "Playlist deleted successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Add song to playlist
    async addSongToPlaylist(req: Request, res: Response) {
        try {
            const playlistId = req.params.id;
            const parsedData = AddSongToPlaylistDto.safeParse(req.body);

            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }

            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const updatedPlaylist = await playlistService.addSongToPlaylist(playlistId, parsedData.data, userId);
            return res.status(200).json({
                success: true,
                data: updatedPlaylist,
                message: "Song added to playlist successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Remove song from playlist
    async removeSongFromPlaylist(req: Request, res: Response) {
        try {
            const { id: playlistId, songId } = req.params;

            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const updatedPlaylist = await playlistService.removeSongFromPlaylist(playlistId, songId, userId);
            return res.status(200).json({
                success: true,
                data: updatedPlaylist,
                message: "Song removed from playlist successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Reorder songs in playlist
    async reorderSongsInPlaylist(req: Request, res: Response) {
        try {
            const playlistId = req.params.id;
            const parsedData = ReorderSongsDto.safeParse(req.body);

            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }

            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const updatedPlaylist = await playlistService.reorderSongsInPlaylist(playlistId, parsedData.data, userId);
            return res.status(200).json({
                success: true,
                data: updatedPlaylist,
                message: "Playlist songs reordered successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Toggle favorite on a playlist
    async toggleFavorite(req: Request, res: Response) {
        try {
            const playlistId = req.params.id;
            const userId = req.user?._id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const result = await playlistService.toggleFavorite(playlistId, userId);
            return res.status(200).json({
                success: true,
                data: result,
                message: result.message
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Check if user favorited a playlist
    async checkIfFavorited(req: Request, res: Response) {
        try {
            const playlistId = req.params.id;
            const userId = req.user?._id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const favorited = await playlistService.checkIfFavorited(playlistId, userId);
            return res.status(200).json({
                success: true,
                data: { favorited },
                message: "Favorite status retrieved"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Get user's favorited playlists
    async getFavoritedPlaylists(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const playlists = await playlistService.getFavoritedPlaylists(userId, page, limit);
            return res.status(200).json({
                success: true,
                data: playlists,
                count: playlists.length,
                message: "Favorited playlists retrieved successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}
