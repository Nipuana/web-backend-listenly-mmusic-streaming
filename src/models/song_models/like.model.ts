import mongoose, { Document, Schema } from "mongoose";

const LikeSchema: Schema = new Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true 
        },
        songId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Song',
            required: true 
        },
    },
    {
        timestamps: true
    }
);

// Compound index for efficient queries - prevents duplicate likes
LikeSchema.index({ userId: 1, songId: 1 }, { unique: true });
// Index for getting all songs liked by a user
LikeSchema.index({ userId: 1, createdAt: -1 });
// Index for getting all users who liked a song
LikeSchema.index({ songId: 1, createdAt: -1 });

export interface ILike extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    songId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const LikeModel = mongoose.model<ILike>("Like", LikeSchema);
