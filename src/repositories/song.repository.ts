import { ISong, SongModel } from "../models/song.model";

export interface ISongRepository {
    createSong(data: Partial<ISong>): Promise<ISong>;
    getSongById(id: string): Promise<ISong | null>;
    getAllSongs(filter?: any, options?: any): Promise<ISong[]>;
    updateSongById(id: string, data: Partial<ISong>): Promise<ISong | null>;
    deleteSongById(id: string): Promise<ISong | null>;
    getSongsByGenre(genre: string): Promise<ISong[]>;
    getSongsByUploadedBy(userId: string): Promise<ISong[]>;
    searchSongs(searchTerm: string): Promise<ISong[]>;
    incrementPlayCount(id: string): Promise<ISong | null>;
    incrementListenTime(id: string, seconds: number): Promise<ISong | null>;
}

export class SongRepository implements ISongRepository {
    async createSong(data: Partial<ISong>): Promise<ISong> {
        const newSong = new SongModel(data);
        await newSong.save();
        return newSong;
    }

    async getSongById(id: string): Promise<ISong | null> {
        const song = await SongModel.findById(id).populate('uploadedBy', 'username email');
        return song;
    }

    async getAllSongs(filter: any = {}, options: any = {}): Promise<ISong[]> {
        const { sortBy = 'createdAt', order = 'desc', limit = 20, skip = 0 } = options;
        const sortOrder = order === 'asc' ? 1 : -1;
        
        const songs = await SongModel
            .find(filter)
            .sort({ [sortBy]: sortOrder })
            .limit(limit)
            .skip(skip)
            .populate('uploadedBy', 'username email');
        return songs;
    }

    async updateSongById(id: string, data: Partial<ISong>): Promise<ISong | null> {
        const updatedSong = await SongModel.findByIdAndUpdate(id, data, { new: true });
        return updatedSong;
    }

    async deleteSongById(id: string): Promise<ISong | null> {
        const deletedSong = await SongModel.findByIdAndDelete(id);
        return deletedSong;
    }

    async getSongsByGenre(genre: string): Promise<ISong[]> {
        const songs = await SongModel.find({ genre }).populate('uploadedBy', 'username email');
        return songs;
    }

    async getSongsByUploadedBy(userId: string): Promise<ISong[]> {
        const songs = await SongModel.find({ uploadedBy: userId }).populate('uploadedBy', 'username email');
        return songs;
    }

    async searchSongs(searchTerm: string): Promise<ISong[]> {
        const songs = await SongModel
            .find({ $text: { $search: searchTerm } })
            .populate('uploadedBy', 'username email');
        return songs;
    }

    async incrementPlayCount(id: string): Promise<ISong | null> {
        const song = await SongModel.findByIdAndUpdate(
            id,
            { $inc: { playCount: 1 } },
            { new: true }
        );
        return song;
    }

    async incrementListenTime(id: string, seconds: number): Promise<ISong | null> {
        const song = await SongModel.findByIdAndUpdate(
            id,
            { $inc: { listenTimeSeconds: seconds } },
            { new: true }
        );
        return song;
    }

    async incrementLikeCount(id: string): Promise<ISong | null> {
        const song = await SongModel.findByIdAndUpdate(
            id,
            { $inc: { likeCount: 1 } },
            { new: true }
        );
        return song;
    }

    async decrementLikeCount(id: string): Promise<ISong | null> {
        const song = await SongModel.findByIdAndUpdate(
            id,
            { $inc: { likeCount: -1 } },
            { new: true }
        );
        return song;
    }
}
