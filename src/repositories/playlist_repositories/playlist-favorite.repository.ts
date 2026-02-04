import { IPlaylistFavorite, PlaylistFavoriteModel } from "../../models/playlist_models/playlist-favorite.model";

export interface IPlaylistFavoriteRepository {
    createFavorite(userId: string, playlistId: string): Promise<IPlaylistFavorite>;
    deleteFavorite(userId: string, playlistId: string): Promise<IPlaylistFavorite | null>;
    getFavorite(userId: string, playlistId: string): Promise<IPlaylistFavorite | null>;
    getFavoritesByPlaylistId(playlistId: string, limit?: number, skip?: number): Promise<IPlaylistFavorite[]>;
    getFavoritesByUserId(userId: string, limit?: number, skip?: number): Promise<IPlaylistFavorite[]>;
    countFavoritesByPlaylistId(playlistId: string): Promise<number>;
}

export class PlaylistFavoriteRepository implements IPlaylistFavoriteRepository {
    async createFavorite(userId: string, playlistId: string): Promise<IPlaylistFavorite> {
        const favorite = new PlaylistFavoriteModel({ userId, playlistId });
        await favorite.save();
        return favorite;
    }

    async deleteFavorite(userId: string, playlistId: string): Promise<IPlaylistFavorite | null> {
        const favorite = await PlaylistFavoriteModel.findOneAndDelete({ userId, playlistId });
        return favorite;
    }

    async getFavorite(userId: string, playlistId: string): Promise<IPlaylistFavorite | null> {
        const favorite = await PlaylistFavoriteModel.findOne({ userId, playlistId });
        return favorite;
    }

    async getFavoritesByPlaylistId(playlistId: string, limit: number = 100, skip: number = 0): Promise<IPlaylistFavorite[]> {
        const favorites = await PlaylistFavoriteModel
            .find({ playlistId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .populate('userId', 'username email');
        return favorites;
    }

    async getFavoritesByUserId(userId: string, limit: number = 100, skip: number = 0): Promise<IPlaylistFavorite[]> {
        const favorites = await PlaylistFavoriteModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .populate('playlistId');
        return favorites;
    }

    async countFavoritesByPlaylistId(playlistId: string): Promise<number> {
        const count = await PlaylistFavoriteModel.countDocuments({ playlistId });
        return count;
    }
}
