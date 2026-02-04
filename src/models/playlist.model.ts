import mongoose, { Document, Schema } from "mongoose";
import { PlaylistType } from "../types/playlist.type";

const PlaylistSongSchema = new Schema({
    songId: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
    position: { type: Number, required: true, min: 0 }
}, { _id: false });

const PlaylistSchema: Schema = new Schema(
    {
        name: { type: String, required: true, maxlength: 100 },
        description: { type: String, maxlength: 500 },
        coverImageUrl: { type: String },
        isPublic: { type: Boolean, default: true },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        songs: [PlaylistSongSchema],
        favoriteCount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for efficient queries
PlaylistSchema.index({ name: 'text', description: 'text' });
PlaylistSchema.index({ createdBy: 1 });
PlaylistSchema.index({ isPublic: 1 });
PlaylistSchema.index({ favoriteCount: -1 });

// Virtual for song count
PlaylistSchema.virtual('songCount').get(function(this: IPlaylist) {
    return this.songs ? this.songs.length : 0;
});

// Virtual for total duration (calculated from songs)
PlaylistSchema.virtual('totalDuration').get(function(this: IPlaylist) {
    // This would be calculated by populating songs and summing durations
    return 0; // Placeholder - calculated in service
});

export interface IPlaylist extends Omit<PlaylistType, 'createdBy' | 'songs'> {
    _id: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    songs: Array<{
        songId: mongoose.Types.ObjectId;
        position: number;
    }>;
    createdAt: Date;
    updatedAt: Date;
    songCount?: number;
    totalDuration?: number;
}

export const PlaylistModel = mongoose.model<IPlaylist>("Playlist", PlaylistSchema);
