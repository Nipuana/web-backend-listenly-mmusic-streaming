import mongoose, { Document, Schema } from "mongoose";
import { SongType } from "../../types/song_types/song.type";

const SongSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        album: { type: String, required: false },
        genre: { 
            type: String, 
            enum: [
                'pop',
                'rock',
                'hip-hop',
                'electronic',
                'soul',
                'country',
                'jazz',
                'classical',
                'latin',
                'folk',
                'blues',
                'reggae',
                'metal',
                'gospel',
                'other'
            ],
            default: 'other'
        },
        duration: { type: Number, required: false },
        releaseDate: { type: Date, default: Date.now },
        audioUrl: { type: String, required: false },
        coverImageUrl: { type: String, default: '/uploads/defaults/song_default.png' },
        playCount: { type: Number, default: 0 },
        likeCount: { type: Number, default: 0 },
        listenTimeSeconds: { type: Number, default: 0 },
        visibility: { 
            type: String, 
            enum: ['public', 'private', 'unlisted'], 
            default: 'public' 
        },
        uploadedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true 
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Index for searching and filtering
SongSchema.index({ title: 'text', album: 'text' });
SongSchema.index({ genre: 1 });
SongSchema.index({ uploadedBy: 1 });

export interface ISong extends Omit<SongType, 'uploadedBy'>, Document {
    _id: mongoose.Types.ObjectId;
    uploadedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const SongModel = mongoose.model<ISong>("Song", SongSchema);
// collection name "songs" ("plural of Song")
// SongModel -> db.songs
