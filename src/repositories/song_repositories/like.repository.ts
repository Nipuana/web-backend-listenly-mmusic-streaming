import { ILike, LikeModel } from "../../models/song_models/like.model";

export interface ILikeRepository {
    createLike(userId: string, songId: string): Promise<ILike>;
    deleteLike(userId: string, songId: string): Promise<ILike | null>;
    deleteLikesBySongId(songId: string): Promise<void>;
    getLike(userId: string, songId: string): Promise<ILike | null>;
    getLikesBySongId(songId: string, limit?: number, skip?: number): Promise<ILike[]>;
    getLikesByUserId(userId: string, limit?: number, skip?: number): Promise<ILike[]>;
    getAllLikes(): Promise<ILike[]>;
    countLikesBySongId(songId: string): Promise<number>;
}

export class LikeRepository implements ILikeRepository {
    async createLike(userId: string, songId: string): Promise<ILike> {
        const like = new LikeModel({ userId, songId });
        await like.save();
        return like;
    }

    async deleteLike(userId: string, songId: string): Promise<ILike | null> {
        const like = await LikeModel.findOneAndDelete({ userId, songId });
        return like;
    }

    async deleteLikesBySongId(songId: string): Promise<void> {
        await LikeModel.deleteMany({ songId });
    }

    async getLike(userId: string, songId: string): Promise<ILike | null> {
        const like = await LikeModel.findOne({ userId, songId });
        return like;
    }

    async getLikesBySongId(songId: string, limit: number = 100, skip: number = 0): Promise<ILike[]> {
        const likes = await LikeModel
            .find({ songId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .populate('userId', 'username email');
        return likes;
    }

    async getLikesByUserId(userId: string, limit: number = 100, skip: number = 0): Promise<ILike[]> {
        const likes = await LikeModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);
        return likes;
    }

    async countLikesBySongId(songId: string): Promise<number> {
        const count = await LikeModel.countDocuments({ songId });
        return count;
    }

    async getAllLikes(): Promise<ILike[]> {
        const likes = await LikeModel.find({});
        return likes;
    }
}
