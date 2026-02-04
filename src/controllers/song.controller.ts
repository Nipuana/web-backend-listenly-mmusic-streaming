import { SongService } from "../services/song.service";
import { CreateSongDto, UpdateSongDto, QuerySongsDto } from "../dtos/song.dtos";
import { Utils } from "../utils/common.utils";
import { Request, Response } from "express";
import z from "zod";

const songService = new SongService();

export class SongController {
    // Create a new song
    async createSong(req: Request, res: Response) {
        try {
            // Handle file uploads
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const audioFile = files?.['audioFile']?.[0];
            const coverImage = files?.['coverImage']?.[0];

            Utils.validateFilePresence(audioFile, 'Audio file');

            // Prepare data with file URLs
            const bodyData = {
                ...req.body,
                audioUrl: `/uploads/audio/${audioFile.filename}`,
                coverImageUrl: coverImage ? Utils.generateFileUrl('images/song_img', coverImage.filename) : undefined,
                duration: req.body.duration ? parseFloat(req.body.duration) : undefined,
            };

            const parsedData = CreateSongDto.safeParse(bodyData);
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

            const newSong = await songService.createSong(parsedData.data, userId, req.user);
            return res.status(201).json({
                success: true,
                data: newSong,
                message: "Song created successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Get all songs with filtering and pagination
    async getAllSongs(req: Request, res: Response) {
        try {
            const queryData = {
                genre: req.query.genre as string,
                artist: req.query.artist as string,
                search: req.query.search as string,
                sortBy: req.query.sortBy as string,
                order: req.query.order as string,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                page: req.query.page ? parseInt(req.query.page as string) : undefined,
            };

            const parsedQuery = QuerySongsDto.safeParse(queryData);
            if (!parsedQuery.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedQuery.error)
                });
            }

            const songs = await songService.getAllSongs(parsedQuery.data);

            return res.status(200).json({
                success: true,
                data: songs,
                count: songs.length,
                message: "Songs retrieved successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Get song by ID
    async getSongById(req: Request, res: Response) {
        try {
            const songId = req.params.id;
            const song = await songService.getSongById(songId);
            return res.status(200).json({
                success: true,
                data: song,
                message: "Song retrieved successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Get current user's songs
    async getMySongs(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const songs = await songService.getMySongs(userId);
            return res.status(200).json({
                success: true,
                data: songs,
                count: songs.length,
                message: "Your songs retrieved successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Update song
    async updateSong(req: Request, res: Response) {
        try {
            const songId = req.params.id;

            // Handle file uploads
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const audioFile = files?.['audioFile']?.[0];
            const coverImage = files?.['coverImage']?.[0];

            const bodyData = {
                ...req.body,
                ...(audioFile && { audioUrl: `/uploads/audio/${audioFile.filename}` }),
                ...(coverImage && { coverImageUrl: `/uploads/images/song_img/${coverImage.filename}` }),
                ...(req.body.duration && { duration: parseFloat(req.body.duration) }),
            };

            const parsedData = UpdateSongDto.safeParse(bodyData);
            
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

            const updatedSong = await songService.updateSong(songId, parsedData.data, userId);
            return res.status(200).json({
                success: true,
                data: updatedSong,
                message: "Song updated successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Delete song
    async deleteSong(req: Request, res: Response) {
        try {
            const songId = req.params.id;
            const userId = req.user?._id;
            const userRole = req.user?.role;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const deletedSong = await songService.deleteSong(songId, userId, userRole);
            return res.status(200).json({
                success: true,
                data: deletedSong,
                message: "Song deleted successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Get songs by user ID
    async getSongsByUserId(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            const songs = await songService.getSongsByUserId(userId);
            return res.status(200).json({
                success: true,
                data: songs,
                count: songs.length,
                message: "Songs retrieved successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Get songs by genre
    async getSongsByGenre(req: Request, res: Response) {
        try {
            const genre = req.params.genre;
            const songs = await songService.getSongsByGenre(genre);
            return res.status(200).json({
                success: true,
                data: songs,
                count: songs.length,
                message: "Songs retrieved successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Increment play count
    async incrementPlayCount(req: Request, res: Response) {
        try {
            const songId = req.params.id;
            const song = await songService.incrementPlayCount(songId);
            return res.status(200).json({
                success: true,
                data: song,
                message: "Play count updated"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}
