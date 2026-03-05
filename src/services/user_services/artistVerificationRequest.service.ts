import { HttpError } from "../../errors/http-error";
import { UserRepository } from "../../repositories/user_repositories/auth.repository";
import { ArtistVerificationRequestRepository } from "../../repositories/user_repositories/artistVerificationRequest.repository";
import {
    ArtistVerificationStatus,
    IArtistVerificationRequest,
} from "../../models/user_models/artistVerificationRequest.model";
import { CreateArtistVerificationRequestDto } from "../../dtos/user_dtos/artistVerificationRequest.dtos";

const VALID_STATUSES: ArtistVerificationStatus[] = ["pending", "approved", "declined"];

export class ArtistVerificationRequestService {
    private userRepository = new UserRepository();
    private requestRepository = new ArtistVerificationRequestRepository();

    async submitRequest(userId: string, data: CreateArtistVerificationRequestDto): Promise<IArtistVerificationRequest> {
        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        if (user.role === "artist") {
            throw new HttpError(400, "You are already an artist");
        }
        if (user.role === "admin") {
            throw new HttpError(400, "Admins do not need verification");
        }

        const pending = await this.requestRepository.findPendingByUserId(userId);
        if (pending) {
            throw new HttpError(409, "You already have a pending verification request");
        }

        try {
            return await this.requestRepository.create({
                userId,
                message: data.message,
            });
        } catch (err: any) {
            // Handles the unique partial index for pending requests.
            if (err?.code === 11000) {
                throw new HttpError(409, "You already have a pending verification request");
            }
            throw err;
        }
    }

    async getMyLatestRequest(userId: string): Promise<IArtistVerificationRequest | null> {
        return this.requestRepository.findLatestByUserId(userId);
    }

    async listRequests(status?: string): Promise<IArtistVerificationRequest[]> {
        if (status && !VALID_STATUSES.includes(status as ArtistVerificationStatus)) {
            throw new HttpError(400, "Invalid status filter");
        }
        return this.requestRepository.list(status as ArtistVerificationStatus | undefined);
    }

    async approveRequest(
        adminId: string,
        requestId: string,
        adminNote?: string
    ): Promise<IArtistVerificationRequest> {
        const request = await this.requestRepository.getById(requestId);
        if (!request) {
            throw new HttpError(404, "Verification request not found");
        }
        if (request.status !== "pending") {
            throw new HttpError(409, "Only pending requests can be approved");
        }

        const userId = (request.userId as any)?._id?.toString?.() || request.userId.toString();
        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        if (user.role !== "artist") {
            await this.userRepository.updateUserById(userId, { role: "artist" } as any);
        }

        const reviewed = await this.requestRepository.review(requestId, {
            status: "approved",
            reviewedBy: adminId,
            reviewedAt: new Date(),
            adminNote,
        });

        if (!reviewed) {
            throw new HttpError(500, "Failed to approve request");
        }
        return reviewed;
    }

    async declineRequest(
        adminId: string,
        requestId: string,
        adminNote?: string
    ): Promise<IArtistVerificationRequest> {
        const request = await this.requestRepository.getById(requestId);
        if (!request) {
            throw new HttpError(404, "Verification request not found");
        }
        if (request.status !== "pending") {
            throw new HttpError(409, "Only pending requests can be declined");
        }

        const reviewed = await this.requestRepository.review(requestId, {
            status: "declined",
            reviewedBy: adminId,
            reviewedAt: new Date(),
            adminNote,
        });

        if (!reviewed) {
            throw new HttpError(500, "Failed to decline request");
        }
        return reviewed;
    }
}
