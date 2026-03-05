import request from 'supertest';
import app from "../../app";
import { SongModel } from '../../models/song_models/song.model';
import { UserModel } from '../../models/user_models/auth.model';

describe('Song Integration Tests', () => {
  const unique = Date.now();
  const email = `song_test_${unique}@test.com`;
  const username = `song_test_${unique}`;
  const password = 'Test@1234';

  let token = '';
  let userId = '';
  let songIds: string[] = [];

  beforeAll(async () => {
    await UserModel.deleteOne({ email });
    // register
    await request(app)
      .post('/api/auth/register')
      .send({ email, username, password, confirmPassword: password, role: 'user' })
      .expect(201);

    const loginRes = await request(app).post('/api/auth/login').send({ email, password }).expect(200);
    token = loginRes.body.token;
    userId = loginRes.body.data?._id;

    // seed songs directly into DB (avoids file upload handling)
    const songs = await SongModel.create([
      { title: `SI Song A ${unique}`, uploadedBy: userId, playCount: 2, listenTimeSeconds: 10, visibility: 'public' },
      { title: `SI Song B ${unique}`, uploadedBy: userId, playCount: 1, listenTimeSeconds: 5, visibility: 'public' },
    ]);
    songIds = songs.map(s => s._id.toString());
  });

  afterAll(async () => {
    // cleanup
    await SongModel.deleteMany({ uploadedBy: userId });
    await UserModel.deleteOne({ email });
  });

  test('GET /api/songs/getSongById/:id returns song', async () => {
    const res = await request(app)
      .get(`/api/songs/getSongById/${songIds[0]}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('title');
    expect(res.body.data.title).toContain(`SI Song A ${unique}`);
  });

  test('POST /api/songs/play-count/:id increments playCount', async () => {
    const before = await SongModel.findById(songIds[0]);
    const res = await request(app)
      .post(`/api/songs/play-count/${songIds[0]}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('playCount');
    expect(res.body.data.playCount).toBe((before?.playCount ?? 0) + 1);
  });

  test('POST /api/songs/listen-time/:id adds listen time', async () => {
    const before = await SongModel.findById(songIds[1]);
    const res = await request(app)
      .post(`/api/songs/listen-time/${songIds[1]}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ seconds: 30 })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('listenTimeSeconds');
    expect(res.body.data.listenTimeSeconds).toBe((before?.listenTimeSeconds ?? 0) + 30);
  });

  test('GET /api/songs/my-songs returns user songs', async () => {
    const res = await request(app)
      .get('/api/songs/my-songs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  test('GET /api/songs/get-all-songs returns list', async () => {
    const res = await request(app)
      .get('/api/songs/get-all-songs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
