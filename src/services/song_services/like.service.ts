import { LikeRepository } from "../../repositories/song_repositories/like.repository";
import { SongRepository } from "../../repositories/song_repositories/song.repository";
import { HttpError } from "../../errors/http-error";

const likeRepository = new LikeRepository();
const songRepository = new SongRepository();

export class LikeService {
    async toggleLike(songId: string, userId: string) {
        // Check if song exists
        const song = await songRepository.getSongById(songId);
        if (!song) {
            throw new HttpError(404, "Song not found");
        }

        // Check if already liked
        const existingLike = await likeRepository.getLike(userId, songId);

        if (existingLike) {
            // Unlike: Remove like and decrement count
            await likeRepository.deleteLike(userId, songId);
            await songRepository.decrementLikeCount(songId);
            return { liked: false, message: "Song unliked" };
        } else {
            // Like: Add like and increment count
            await likeRepository.createLike(userId, songId);
            await songRepository.incrementLikeCount(songId);
            return { liked: true, message: "Song liked" };
        }
    }

    async checkIfLiked(songId: string, userId: string): Promise<boolean> {
        const like = await likeRepository.getLike(userId, songId);
        return !!like;
    }

    async getLikedSongs(userId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const likes = await likeRepository.getLikesByUserId(userId, limit, skip);
        
        // Extract songs from likes
        const songs = likes.map(like => like.songId);
        return songs;
    }

    async getUsersWhoLikedSong(songId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const likes = await likeRepository.getLikesBySongId(songId, limit, skip);
        
        // Extract users from likes
        const users = likes.map(like => like.userId);
        return users;
    }
}
