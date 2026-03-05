import mongoose from "mongoose";
import {
    ArtistVerificationRequestModel,
    IArtistVerificationRequest,
    ArtistVerificationStatus,
} from "../../models/user_models/artistVerificationRequest.model";

export class ArtistVerificationRequestRepository {
    async create(data: {
        userId: mongoose.Types.ObjectId | string;
        message?: string;
    }): Promise<IArtistVerificationRequest> {
        const doc = new ArtistVerificationRequestModel({
            userId: data.userId,
            message: data.message,
        });
        await doc.save();
        return doc;
    }

    async findPendingByUserId(userId: string): Promise<IArtistVerificationRequest | null> {
        return ArtistVerificationRequestModel.findOne({ userId, status: "pending" });
    }

    async findLatestByUserId(userId: string): Promise<IArtistVerificationRequest | null> {
        return ArtistVerificationRequestModel.findOne({ userId }).sort({ createdAt: -1 });
    }

    async list(status?: ArtistVerificationStatus): Promise<IArtistVerificationRequest[]> {
        const query: Record<string, any> = {};
        if (status) query.status = status;
        return ArtistVerificationRequestModel.find(query)
            .sort({ createdAt: -1 })
            .populate("userId", "email username role profilePicture")
            .populate("reviewedBy", "email username role");
    }

    async getById(id: string): Promise<IArtistVerificationRequest | null> {
        return ArtistVerificationRequestModel.findById(id)
            .populate("userId", "email username role profilePicture")
            .populate("reviewedBy", "email username role");
    }

    async review(
        requestId: string,
        data: {
            status: Exclude<ArtistVerificationStatus, "pending">;
            reviewedBy: string;
            reviewedAt: Date;
            adminNote?: string;
        }
    ): Promise<IArtistVerificationRequest | null> {
        return ArtistVerificationRequestModel.findByIdAndUpdate(
            requestId,
            {
                status: data.status,
                reviewedBy: data.reviewedBy,
                reviewedAt: data.reviewedAt,
                adminNote: data.adminNote,
            },
            { new: true }
        )
            .populate("userId", "email username role profilePicture")
            .populate("reviewedBy", "email username role");
    }
}
