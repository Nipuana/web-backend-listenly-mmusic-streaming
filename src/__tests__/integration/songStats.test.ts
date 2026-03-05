import request from "supertest";
import app from "../../app";
import { SongModel } from "../../models/song_models/song.model";
import { UserModel } from "../../models/user_models/auth.model";

async function getCurrentTotals() {
    const result = await SongModel.aggregate([
        {
            $group: {
                _id: null,
                totalStreams: { $sum: "$playCount" },
                totalListenTimeSeconds: { $sum: "$listenTimeSeconds" },
                songCount: { $sum: 1 },
            },
        },
    ]);

    const row = result?.[0];
    return {
        totalStreams: row?.totalStreams ?? 0,
        totalListenTimeSeconds: row?.totalListenTimeSeconds ?? 0,
        songCount: row?.songCount ?? 0,
    };
}

describe("Song overall stats", () => {
    test("GET /api/songs/stats/overall returns summed totals", async () => {
        const unique = Date.now();
        const email = `stats_${unique}@test.com`;
        const username = `stats_${unique}`;
        const password = "Test@1234";

        await request(app)
            .post("/api/auth/register")
            .send({
                email,
                username,
                password,
                confirmPassword: password,
                role: "user",
            })
            .expect(201);

        const loginRes = await request(app).post("/api/auth/login").send({ email, password }).expect(200);
        const token = loginRes.body?.token;
        expect(typeof token).toBe("string");

        const user = await UserModel.findOne({ email });
        expect(user).toBeTruthy();

        const before = await getCurrentTotals();

        await SongModel.create([
            {
                title: `Song A ${unique}`,
                uploadedBy: user!._id,
                playCount: 10,
                listenTimeSeconds: 120,
                visibility: "public",
            },
            {
                title: `Song B ${unique}`,
                uploadedBy: user!._id,
                playCount: 3,
                listenTimeSeconds: 45,
                visibility: "public",
            },
        ]);

        const res = await request(app)
            .get("/api/songs/stats/overall")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual({
            totalStreams: before.totalStreams + 13,
            totalListenTimeSeconds: before.totalListenTimeSeconds + 165,
            songCount: before.songCount + 2,
        });
    });
});
