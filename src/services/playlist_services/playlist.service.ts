import { PlaylistRepository } from "../../repositories/playlist_repositories/playlist.repository";
import { PlaylistFavoriteRepository } from "../../repositories/playlist_repositories/playlist-favorite.repository";
import { SongRepository } from "../../repositories/song_repositories/song.repository";
import { CreatePlaylistDto, UpdatePlaylistDto, QueryPlaylistsDto, AddSongToPlaylistDto, ReorderSongsDto } from "../../dtos/playlist_dtos/playlist.dtos";
import { HttpError } from "../../errors/http-error";
import { Utils } from "../../utils/common.utils";
import { PlaylistModel } from "../../models/playlist_models/playlist.model";
import { UserModel } from "../../models/user_models/auth.model";

const playlistRepository = new PlaylistRepository();
const playlistFavoriteRepository = new PlaylistFavoriteRepository();
const songRepository = new SongRepository();

export class PlaylistService {
    async createPlaylist(data: CreatePlaylistDto, userId: string) {
        const playlistData = {
            ...data,
            createdBy: Utils.toObjectId(userId),
            songs: [],
            favoriteCount: 0
        };

        const newPlaylist = await playlistRepository.createPlaylist(playlistData);
        return newPlaylist;
    }

    async getPlaylistById(playlistId: string, userId?: string) {
        const playlist = await playlistRepository.getPlaylistById(playlistId);

        if (!playlist) {
            throw new HttpError(404, "Playlist not found");
        }

        // Check if playlist is private and user is not the owner
        if (playlist.visibility === 'private' && (!userId || !playlist.createdBy._id.equals(userId))) {
            throw new HttpError(403, "This playlist is private");
        }

        // Calculate total duration and get artist/album info
        const enrichedPlaylist = await this.enrichPlaylistData(playlist);
        return enrichedPlaylist;
    }

    async getAllPlaylists(query: QueryPlaylistsDto) {
        const { search, sortBy, order, limit, page } = query;

        // Build filter - only public playlists for general browsing
        const filter: any = { visibility: 'public' };

        // Handle text search
        if (search) {
            const playlists = await playlistRepository.searchPlaylists(search);
            return playlists;
        }

        // Pagination
        const skip = (page - 1) * limit;
        const options = {
            sortBy: sortBy || 'createdAt',
            order: order || 'desc',
            limit,
            skip
        };

        const playlists = await playlistRepository.getAllPlaylists(filter, options);
        return playlists;
    }

    async updatePlaylist(playlistId: string, data: UpdatePlaylistDto, userId: string) {
        const playlist = await playlistRepository.getPlaylistById(playlistId);

        if (!playlist) {
            throw new HttpError(404, "Playlist not found");
        }

        // Check if user is the owner
        if (!playlist.createdBy._id.equals(userId)) {
            throw new HttpError(403, "You are not authorized to update this playlist");
        }

        // Ensure coverImageUrl has default if set to empty
        if (data.coverImageUrl === '') {
            data.coverImageUrl = '/uploads/defaults/playlist_default.png';
        }

        const updatedPlaylist = await playlistRepository.updatePlaylistById(playlistId, data);
        if (!updatedPlaylist?.coverImageUrl) {
            await playlistRepository.updatePlaylistById(playlistId, {
                coverImageUrl: '/uploads/defaults/playlist_default.png'
            });
        }
        return updatedPlaylist;
    }

    async deletePlaylist(playlistId: string, userId: string) {
        const playlist = await playlistRepository.getPlaylistById(playlistId);

        if (!playlist) {
            throw new HttpError(404, "Playlist not found");
        }

        // Check if user is the owner
        if (!playlist.createdBy._id.equals(userId)) {
            throw new HttpError(403, "You are not authorized to delete this playlist");
        }

        const deletedPlaylist = await playlistRepository.deletePlaylistById(playlistId);
        return deletedPlaylist;
    }

    async getMyPlaylists(userId: string) {
        const playlists = await playlistRepository.getPlaylistsByUserId(userId);
        return playlists;
    }

    async addSongToPlaylist(playlistId: string, songData: AddSongToPlaylistDto, userId: string) {
        const playlist = await playlistRepository.getPlaylistById(playlistId);

        if (!playlist) {
            throw new HttpError(404, "Playlist not found");
        }

        // Check if user is the owner
        if (!playlist.createdBy._id.equals(userId)) {
            throw new HttpError(403, "You are not authorized to modify this playlist");
        }

        // Check if song exists
        const song = await songRepository.getSongById(songData.songId);
        if (!song) {
            throw new HttpError(404, "Song not found");
        }

        const updatedPlaylist = await playlistRepository.addSongToPlaylist(
            playlistId,
            songData.songId,
            songData.position
        );

        return updatedPlaylist;
    }

    async removeSongFromPlaylist(playlistId: string, songId: string, userId: string) {
        const playlist = await playlistRepository.getPlaylistById(playlistId);

        if (!playlist) {
            throw new HttpError(404, "Playlist not found");
        }

        // Check if user is the owner
        if (!playlist.createdBy._id.equals(userId)) {
            throw new HttpError(403, "You are not authorized to modify this playlist");
        }

        const updatedPlaylist = await playlistRepository.removeSongFromPlaylist(playlistId, songId);
        return updatedPlaylist;
    }

    async reorderSongsInPlaylist(playlistId: string, reorderData: ReorderSongsDto, userId: string) {
        const playlist = await playlistRepository.getPlaylistById(playlistId);

        if (!playlist) {
            throw new HttpError(404, "Playlist not found");
        }

        // Check if user is the owner
        if (!playlist.createdBy._id.equals(userId)) {
            throw new HttpError(403, "You are not authorized to modify this playlist");
        }

        const updatedPlaylist = await playlistRepository.reorderSongsInPlaylist(playlistId, reorderData.songOrders);
        return updatedPlaylist;
    }

    async toggleFavorite(playlistId: string, userId: string) {
        // Check if playlist exists
        const playlist = await playlistRepository.getPlaylistById(playlistId);
        if (!playlist) {
            throw new HttpError(404, "Playlist not found");
        }

        // Check if already favorited
        const existingFavorite = await playlistFavoriteRepository.getFavorite(userId, playlistId);

        if (existingFavorite) {
            // Unfavorite: Remove favorite and decrement count
            await playlistFavoriteRepository.deleteFavorite(userId, playlistId);
            await playlistRepository.decrementFavoriteCount(playlistId);
            return { favorited: false, message: "Playlist unfavorited" };
        } else {
            // Favorite: Add favorite and increment count
            await playlistFavoriteRepository.createFavorite(userId, playlistId);
            await playlistRepository.incrementFavoriteCount(playlistId);
            return { favorited: true, message: "Playlist favorited" };
        }
    }

    async checkIfFavorited(playlistId: string, userId: string): Promise<boolean> {
        const favorite = await playlistFavoriteRepository.getFavorite(userId, playlistId);
        return !!favorite;
    }

    async getFavoritedPlaylists(userId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const favorites = await playlistFavoriteRepository.getFavoritesByUserId(userId, limit, skip);

        // Extract playlists from favorites
        const playlists = favorites.map(favorite => favorite.playlistId);
        return playlists;
    }

    async cleanOrphanedFavorites() {
        const allFavorites = await playlistFavoriteRepository.getAllFavorites();
        let deletedCount = 0;

        for (const favorite of allFavorites) {
            const [playlistExists, userExists] = await Promise.all([
                PlaylistModel.exists({ _id: favorite.playlistId }),
                UserModel.exists({ _id: favorite.userId }),
            ]);

            if (!playlistExists || !userExists) {
                await playlistFavoriteRepository.deleteFavoriteById(favorite._id.toString());
                deletedCount++;

                // If playlist still exists but user is missing, keep favoriteCount accurate.
                if (playlistExists && !userExists) {
                    await playlistRepository.decrementFavoriteCount(favorite.playlistId.toString());
                }
            }
        }

        return { message: `Cleaned up ${deletedCount} orphaned favorites` };
    }

    // Helper method to enrich playlist with calculated data
    private async enrichPlaylistData(playlist: any) {
        const songIds = playlist.songs.map((s: any) => s.songId._id.toString());

        if (songIds.length === 0) {
            return {
                ...playlist.toObject(),
                totalDuration: 0,
                artists: [],
                albums: []
            };
        }

        // Get all songs to calculate stats
        const songs = await Promise.all(
            songIds.map((id: string) => songRepository.getSongById(id))
        );

        const validSongs = songs.filter(song => song !== null);
        const totalDuration = validSongs.reduce((sum, song) => sum + (song?.duration || 0), 0);

        // Get unique artists and albums
        const artists = [...new Set(validSongs.map(song => song?.uploadedBy?.username).filter(Boolean))];
        const albums = [...new Set(validSongs.map(song => song?.album).filter(Boolean))];

        return {
            ...playlist.toObject(),
            totalDuration,
            artists,
            albums
        };
    }
}
