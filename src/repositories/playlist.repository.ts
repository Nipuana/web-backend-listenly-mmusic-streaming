import { IPlaylist, PlaylistModel } from "../models/playlist.model";
import { Utils } from "../utils/common.utils";

export interface IPlaylistRepository {
    createPlaylist(data: Partial<IPlaylist>): Promise<IPlaylist>;
    getPlaylistById(id: string): Promise<IPlaylist | null>;
    getAllPlaylists(filter?: any, options?: any): Promise<IPlaylist[]>;
    updatePlaylistById(id: string, data: Partial<IPlaylist>): Promise<IPlaylist | null>;
    deletePlaylistById(id: string): Promise<IPlaylist | null>;
    getPlaylistsByUserId(userId: string): Promise<IPlaylist[]>;
    addSongToPlaylist(playlistId: string, songId: string, position?: number): Promise<IPlaylist | null>;
    removeSongFromPlaylist(playlistId: string, songId: string): Promise<IPlaylist | null>;
    reorderSongsInPlaylist(playlistId: string, songOrders: Array<{songId: string, position: number}>): Promise<IPlaylist | null>;
    searchPlaylists(searchTerm: string): Promise<IPlaylist[]>;
    incrementFavoriteCount(id: string): Promise<IPlaylist | null>;
    decrementFavoriteCount(id: string): Promise<IPlaylist | null>;
}

export class PlaylistRepository implements IPlaylistRepository {
    async createPlaylist(data: Partial<IPlaylist>): Promise<IPlaylist> {
        const newPlaylist = new PlaylistModel(data);
        await newPlaylist.save();
        return newPlaylist;
    }

    async getPlaylistById(id: string): Promise<IPlaylist | null> {
        const playlist = await PlaylistModel
            .findById(id)
            .populate('createdBy', 'username email')
            .populate({
                path: 'songs.songId',
                select: 'title artist duration audioUrl coverImageUrl'
            });
        return playlist;
    }

    async getAllPlaylists(filter: any = {}, options: any = {}): Promise<IPlaylist[]> {
        const { sortBy = 'createdAt', order = 'desc', limit = 20, skip = 0 } = options;
        const sortOrder = order === 'asc' ? 1 : -1;

        const playlists = await PlaylistModel
            .find(filter)
            .sort({ [sortBy]: sortOrder })
            .limit(limit)
            .skip(skip)
            .populate('createdBy', 'username email');
        return playlists;
    }

    async updatePlaylistById(id: string, data: Partial<IPlaylist>): Promise<IPlaylist | null> {
        const updatedPlaylist = await PlaylistModel.findByIdAndUpdate(id, data, { new: true });
        return updatedPlaylist;
    }

    async deletePlaylistById(id: string): Promise<IPlaylist | null> {
        const deletedPlaylist = await PlaylistModel.findByIdAndDelete(id);
        return deletedPlaylist;
    }

    async getPlaylistsByUserId(userId: string): Promise<IPlaylist[]> {
        const playlists = await PlaylistModel
            .find({ createdBy: userId })
            .populate('createdBy', 'username email');
        return playlists;
    }

    async addSongToPlaylist(playlistId: string, songId: string, position?: number): Promise<IPlaylist | null> {
        const playlist = await PlaylistModel.findById(playlistId);
        if (!playlist) return null;

        // If no position provided, add to end
        const pos = position !== undefined ? position : playlist.songs.length;

        // Remove existing song if already in playlist
        playlist.songs = playlist.songs.filter(song => song.songId.toString() !== songId);

        // Add song at specified position
        playlist.songs.splice(pos, 0, { songId: Utils.toObjectId(songId), position: pos });

        // Update positions for songs after the inserted one
        for (let i = pos + 1; i < playlist.songs.length; i++) {
            playlist.songs[i].position = i;
        }

        await playlist.save();
        return playlist;
    }

    async removeSongFromPlaylist(playlistId: string, songId: string): Promise<IPlaylist | null> {
        const playlist = await PlaylistModel.findById(playlistId);
        if (!playlist) return null;

        // Remove the song
        playlist.songs = playlist.songs.filter(song => song.songId.toString() !== songId);

        // Update positions
        playlist.songs.forEach((song, index) => {
            song.position = index;
        });

        await playlist.save();
        return playlist;
    }

    async reorderSongsInPlaylist(playlistId: string, songOrders: Array<{songId: string, position: number}>): Promise<IPlaylist | null> {
        const playlist = await PlaylistModel.findById(playlistId);
        if (!playlist) return null;

        // Create new songs array based on the order provided
        const newSongs = songOrders.map(order => ({
            songId: Utils.toObjectId(order.songId),
            position: order.position
        }));

        playlist.songs = newSongs;
        await playlist.save();
        return playlist;
    }

    async searchPlaylists(searchTerm: string): Promise<IPlaylist[]> {
        const playlists = await PlaylistModel
            .find({ $text: { $search: searchTerm } })
            .populate('createdBy', 'username email');
        return playlists;
    }

    async incrementFavoriteCount(id: string): Promise<IPlaylist | null> {
        const playlist = await PlaylistModel.findByIdAndUpdate(
            id,
            { $inc: { favoriteCount: 1 } },
            { new: true }
        );
        return playlist;
    }

    async decrementFavoriteCount(id: string): Promise<IPlaylist | null> {
        const playlist = await PlaylistModel.findByIdAndUpdate(
            id,
            { $inc: { favoriteCount: -1 } },
            { new: true }
        );
        return playlist;
    }
}
