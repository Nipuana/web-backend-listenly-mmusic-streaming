import { LikeRepository } from "../../repositories/song_repositories/like.repository";
import { SongRepository } from "../../repositories/song_repositories/song.repository";
import { HttpError } from "../../errors/http-error";

const likeRepository = new LikeRepository();
const songRepository = new SongRepository();

export class LikeService {
    async toggleLike(songId: string, userId: string) {
        // Check if already liked
        const existingLike = await likeRepository.getLike(userId, songId);

        if (existingLike) {
            // Unlike: Remove like and decrement count if song exists
            await likeRepository.deleteLike(userId, songId);
            const song = await songRepository.getSongById(songId);
            if (song) {
                await songRepository.decrementLikeCount(songId);
            }
            return { liked: false, message: "Song unliked" };
        } else {
            // Check if song exists before liking
            const song = await songRepository.getSongById(songId);
            if (!song) {
                throw new HttpError(404, "Song not found");
            }
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
        
        // Fetch existing songs only
        const songs = [];
        for (const like of likes) {
            const song = await songRepository.getSongById(like.songId.toString());
            if (song) {
                songs.push(song);
            }
            // Skip if song is null (deleted)
        }
        // Ensure no nulls (extra safety)
        return songs.filter(s => s !== null);
    }

    async getUsersWhoLikedSong(songId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const likes = await likeRepository.getLikesBySongId(songId, limit, skip);
        
        // Extract users from likes
        const users = likes.map(like => like.userId);
        return users;
    }

    async cleanOrphanedLikes() {
        // Find all likes
        const allLikes = await likeRepository.getAllLikes();
        let deletedCount = 0;

        for (const like of allLikes) {
            const song = await songRepository.getSongById(like.songId.toString());
            if (!song) {
                // Song not found, delete the like
                await likeRepository.deleteLike(like.userId.toString(), like.songId.toString());
                deletedCount++;
            }
        }

        return { message: `Cleaned up ${deletedCount} orphaned likes` };
    }
}
