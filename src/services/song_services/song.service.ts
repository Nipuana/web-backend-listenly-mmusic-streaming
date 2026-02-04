import { SongRepository } from "../../repositories/song_repositories/song.repository";
import { CreateSongDto, UpdateSongDto, QuerySongsDto } from "../../dtos/song _dtos/song.dtos";
import { HttpError } from "../../errors/http-error";
import { Utils } from "../../utils/common.utils";

const songRepository = new SongRepository();

export class SongService {
    async createSong(data: CreateSongDto, userId: string, user: any) {
        // Check if user is an artist
        if (!Utils.hasRole(user, 'artist')) {
            throw new HttpError(403, "Only artists can upload songs");
        }

        // Create new song with uploaded user reference
        const songData = {
            ...data,
            uploadedBy: Utils.toObjectId(userId),
            playCount: 0
        };

        const newSong = await songRepository.createSong(songData);
        return newSong;
    }

    async getSongById(songId: string) {
        const song = await songRepository.getSongById(songId);
        if (!song) {
            throw new HttpError(404, "Song not found");
        }
        return song;
    }

    async getAllSongs(query: QuerySongsDto) {
        const { genre, search, sortBy, order, limit, page } = query;
        
        // Build filter object
        const filter: any = { isPublic: true };
        
        if (genre) {
            filter.genre = genre;
        }

        // Handle text search
        if (search) {
            const songs = await songRepository.searchSongs(search);
            return songs;
        }

        // Pagination
        const skip = (page - 1) * limit;
        const options = {
            sortBy: sortBy || 'createdAt',
            order: order || 'desc',
            limit,
            skip
        };

        const songs = await songRepository.getAllSongs(filter, options);
        return songs;
    }

    async updateSong(songId: string, data: UpdateSongDto, userId: string) {
        const song = await songRepository.getSongById(songId);
        
        if (!song) {
            throw new HttpError(404, "Song not found");
        }

        // Check if user is the owner of the song
        if (song.uploadedBy.toString() !== userId) {
            throw new HttpError(403, "You are not authorized to update this song");
        }

        const updatedSong = await songRepository.updateSongById(songId, data);
        return updatedSong;
    }

    async deleteSong(songId: string, userId: string, userRole: string) {
        const song = await songRepository.getSongById(songId);
        
        if (!song) {
            throw new HttpError(404, "Song not found");
        }

        // Check if user is the owner or an admin
        if (song.uploadedBy.toString() !== userId && userRole !== 'admin') {
            throw new HttpError(403, "You are not authorized to delete this song");
        }

        const deletedSong = await songRepository.deleteSongById(songId);
        return deletedSong;
    }

    async getMySongs(userId: string) {
        const songs = await songRepository.getSongsByUploadedBy(userId);
        return songs;
    }

    async getSongsByUserId(userId: string) {
        const songs = await songRepository.getSongsByUploadedBy(userId);
        return songs;
    }

    async getSongsByGenre(genre: string) {
        const songs = await songRepository.getSongsByGenre(genre);
        return songs;
    }

    async incrementPlayCount(songId: string) {
        const song = await songRepository.incrementPlayCount(songId);
        if (!song) {
            throw new HttpError(404, "Song not found");
        }
        return song;
    }

    async addListenTime(songId: string, seconds: number) {
        if (seconds < 0) {
            throw new HttpError(400, "Listen time must be non-negative");
        }

        const song = await songRepository.incrementListenTime(songId, seconds);
        if (!song) {
            throw new HttpError(404, "Song not found");
        }
        return song;
    }
}
