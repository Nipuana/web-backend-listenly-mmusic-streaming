import { LikeService } from "../../services/song_services/like.service";
import { Request, Response } from "express";

const likeService = new LikeService();

export class LikeController {
    // Toggle like/unlike on a song
    async toggleLike(req: Request, res: Response) {
        try {
            const songId = req.params.id;
            const userId = req.user?._id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const result = await likeService.toggleLike(songId, userId);
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

    // Check if user liked a song
    async checkIfLiked(req: Request, res: Response) {
        try {
            const songId = req.params.id;
            const userId = req.user?._id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const liked = await likeService.checkIfLiked(songId, userId);
            return res.status(200).json({
                success: true,
                data: { liked },
                message: "Like status retrieved"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Get user's liked songs
    async getLikedSongs(req: Request, res: Response) {
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

            const songs = await likeService.getLikedSongs(userId, page, limit);
            return res.status(200).json({
                success: true,
                data: songs,
                count: songs.length,
                message: "Liked songs retrieved successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}
