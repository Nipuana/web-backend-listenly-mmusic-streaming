import mongoose, { Document, Schema } from "mongoose";

const PlaylistFavoriteSchema: Schema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        playlistId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Playlist',
            required: true
        },
    },
    {
        timestamps: true
    }
);

// Compound index for efficient queries - prevents duplicate favorites
PlaylistFavoriteSchema.index({ userId: 1, playlistId: 1 }, { unique: true });
// Index for getting all playlists favorited by a user
PlaylistFavoriteSchema.index({ userId: 1, createdAt: -1 });
// Index for getting all users who favorited a playlist
PlaylistFavoriteSchema.index({ playlistId: 1, createdAt: -1 });

export interface IPlaylistFavorite extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    playlistId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const PlaylistFavoriteModel = mongoose.model<IPlaylistFavorite>("PlaylistFavorite", PlaylistFavoriteSchema);
