import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user_models/auth.model';
import { SongModel } from '../../models/song_models/song.model';

describe('Like Integration Tests', () => {
  const unique = Date.now();
  const email = `like_test_${unique}@test.com`;
  const username = `like_test_${unique}`;
  const password = 'Test@1234';

  let token = '';
  let userId = '';
  let songId = '';

  beforeAll(async () => {
    await UserModel.deleteOne({ email });
    await request(app)
      .post('/api/auth/register')
      .send({ email, username, password, confirmPassword: password, role: 'user' })
      .expect(201);

    const loginRes = await request(app).post('/api/auth/login').send({ email, password }).expect(200);
    token = loginRes.body.token;
    userId = loginRes.body.data?._id;

    const song = await SongModel.create({ title: `Like Song ${unique}`, uploadedBy: userId, visibility: 'public' });
    songId = song._id.toString();
  });

  afterAll(async () => {
    await SongModel.deleteOne({ _id: songId });
    await UserModel.deleteOne({ email });
  });

  test('POST /api/songs/change-like-status/:id likes a song', async () => {
    const res = await request(app)
      .post(`/api/songs/change-like-status/${songId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('liked', true);
    expect(res.body.message).toMatch(/liked/i);
  });

  test('GET /api/songs/like-status/:id/liked returns liked true', async () => {
    const res = await request(app)
      .get(`/api/songs/like-status/${songId}/liked`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('liked', true);
  });

  test('POST /api/songs/change-like-status/:id unlikes the song', async () => {
    const res = await request(app)
      .post(`/api/songs/change-like-status/${songId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('liked', false);
    expect(res.body.message).toMatch(/unliked/i);
  });

  test('GET /api/songs/user/liked-songs returns array (possibly empty)', async () => {
    const res = await request(app)
      .get(`/api/songs/user/liked-songs`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
