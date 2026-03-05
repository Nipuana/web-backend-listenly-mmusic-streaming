import mongoose, { Document, Schema } from "mongoose";

export type ArtistVerificationStatus = "pending" | "approved" | "declined";

export interface IArtistVerificationRequest extends Document {
    userId: mongoose.Types.ObjectId;
    status: ArtistVerificationStatus;
    message?: string;
    reviewedBy?: mongoose.Types.ObjectId;
    adminNote?: string;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ArtistVerificationRequestSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        status: {
            type: String,
            enum: ["pending", "approved", "declined"],
            default: "pending",
            required: true,
        },
        message: { type: String, required: false, maxlength: 2000 },
        reviewedBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
        adminNote: { type: String, required: false, maxlength: 2000 },
        reviewedAt: { type: Date, required: false },
    },
    {
        timestamps: true,
    }
);

// Prevent multiple pending requests for the same user.
ArtistVerificationRequestSchema.index(
    { userId: 1, status: 1 },
    {
        unique: true,
        partialFilterExpression: { status: "pending" },
    }
);

export const ArtistVerificationRequestModel = mongoose.model<IArtistVerificationRequest>(
    "ArtistVerificationRequest",
    ArtistVerificationRequestSchema
);
