import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user_models/auth.model";
import { ArtistVerificationRequestModel } from "../../models/user_models/artistVerificationRequest.model";
import { AdminAuditLogModel } from "../../models/admin_models/admin-audit-log.model";

describe("Artist Verification Flow", () => {
    const normalUser = {
        email: "verify_user@example.com",
        username: "verify_user",
        password: "Test@1234",
        confirmPassword: "Test@1234",
        role: "user",
    };

    const adminUser = {
        email: "verify_admin@example.com",
        username: "verify_admin",
        password: "Test@1234",
        confirmPassword: "Test@1234",
        role: "admin",
    };

    const pendingUser = {
        email: "verify_user_pending@example.com",
        username: "verify_user_pending",
        password: "Test@1234",
        confirmPassword: "Test@1234",
        role: "user",
    };

    const pendingAdmin = {
        email: "verify_admin_pending@example.com",
        username: "verify_admin_pending",
        password: "Test@1234",
        confirmPassword: "Test@1234",
        role: "admin",
    };

    let userToken = "";
    let adminToken = "";
    let requestId = "";

    beforeAll(async () => {
        await UserModel.deleteOne({ email: normalUser.email });
        await UserModel.deleteOne({ email: adminUser.email });
        await UserModel.deleteOne({ email: pendingUser.email });
        await UserModel.deleteOne({ email: pendingAdmin.email });
        await ArtistVerificationRequestModel.deleteMany({});
        await AdminAuditLogModel.deleteMany({});
    });

    afterAll(async () => {
        await UserModel.deleteOne({ email: normalUser.email });
        await UserModel.deleteOne({ email: adminUser.email });
        await UserModel.deleteOne({ email: pendingUser.email });
        await UserModel.deleteOne({ email: pendingAdmin.email });
        await ArtistVerificationRequestModel.deleteMany({});
        await AdminAuditLogModel.deleteMany({});
    });

    test("user submits request, admin approves, user becomes artist", async () => {
        // Register + login normal user
        await request(app).post("/api/auth/register").send(normalUser).expect(201);
        const loginUserRes = await request(app)
            .post("/api/auth/login")
            .send({ email: normalUser.email, password: normalUser.password })
            .expect(200);
        userToken = loginUserRes.body.token;

        // Register + login admin
        await request(app).post("/api/auth/register").send(adminUser).expect(201);
        const loginAdminRes = await request(app)
            .post("/api/auth/login")
            .send({ email: adminUser.email, password: adminUser.password })
            .expect(200);
        adminToken = loginAdminRes.body.token;

        // Submit verification request
        const submitRes = await request(app)
            .post("/api/artist-verification/request")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                message: "I am an artist. Please verify my account.",
            })
            .expect(201);
        expect(submitRes.body).toHaveProperty("message", "Artist verification request submitted");
        requestId = submitRes.body.data?._id;
        expect(requestId).toBeTruthy();

        // Admin lists pending requests
        const listRes = await request(app)
            .get("/api/admin/artist-verification/requests?status=pending")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(200);
        expect(Array.isArray(listRes.body.data)).toBe(true);

        // Admin approves
        const approveRes = await request(app)
            .patch(`/api/admin/artist-verification/requests/${requestId}/approve`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ adminNote: "Looks good" })
            .expect(200);
        expect(approveRes.body).toHaveProperty("message", "Artist verification request approved");
        expect(approveRes.body.data).toHaveProperty("status", "approved");

        // Admin action should be audited
        const auditCount = await AdminAuditLogModel.countDocuments({
            action: "ADMIN_APPROVE_ARTIST_VERIFICATION_REQUEST",
        });
        expect(auditCount).toBeGreaterThan(0);

        // Audit logs should be readable but not deletable via API
        const listLogsRes = await request(app)
            .get("/api/admin/audit-logs?limit=5&page=1")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(200);
        expect(Array.isArray(listLogsRes.body.data)).toBe(true);

        // No delete endpoint should exist (Express should return 404)
        await request(app)
            .delete("/api/admin/audit-logs/some-id")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(404);

        // User profile should now show role=artist
        const profileRes = await request(app)
            .get("/api/auth/profile")
            .set("Authorization", `Bearer ${userToken}`)
            .expect(200);
        expect(profileRes.body.data).toHaveProperty("role", "artist");

        // Submitting again should fail (already artist)
        await request(app)
            .post("/api/artist-verification/request")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ message: "another request with enough details" })
            .expect(400);
    });

    test("user can only have one active (pending) request at a time", async () => {
        // Register + login normal user
        await request(app).post("/api/auth/register").send(pendingUser).expect(201);
        const loginUserRes = await request(app)
            .post("/api/auth/login")
            .send({ email: pendingUser.email, password: pendingUser.password })
            .expect(200);
        const pendingUserToken = loginUserRes.body.token;

        // Register + login admin
        await request(app).post("/api/auth/register").send(pendingAdmin).expect(201);
        const loginAdminRes = await request(app)
            .post("/api/auth/login")
            .send({ email: pendingAdmin.email, password: pendingAdmin.password })
            .expect(200);
        const pendingAdminToken = loginAdminRes.body.token;

        // Submit verification request
        const submitRes = await request(app)
            .post("/api/artist-verification/request")
            .set("Authorization", `Bearer ${pendingUserToken}`)
            .send({
                message: "Please verify me as an artist.",
            })
            .expect(201);

        const pendingRequestId = submitRes.body.data?._id;
        expect(pendingRequestId).toBeTruthy();

        // Submitting another request while pending should fail
        await request(app)
            .post("/api/artist-verification/request")
            .set("Authorization", `Bearer ${pendingUserToken}`)
            .send({
                message: "Second attempt while pending",
            })
            .expect(409);

        // Admin declines the pending request
        await request(app)
            .patch(`/api/admin/artist-verification/requests/${pendingRequestId}/decline`)
            .set("Authorization", `Bearer ${pendingAdminToken}`)
            .send({ adminNote: "Not enough info" })
            .expect(200);

        // After decline, user can submit a new request
        await request(app)
            .post("/api/artist-verification/request")
            .set("Authorization", `Bearer ${pendingUserToken}`)
            .send({
                message: "Updated request with more info",
            })
            .expect(201);
    });
});
