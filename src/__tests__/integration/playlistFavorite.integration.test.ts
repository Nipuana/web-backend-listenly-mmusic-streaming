import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user_models/auth.model';
import { PlaylistModel } from '../../models/playlist_models/playlist.model';

describe('Playlist Favorite Integration Tests', () => {
  const unique = Date.now();
  const email = `plfav_test_${unique}@test.com`;
  const username = `plfav_test_${unique}`;
  const password = 'Test@1234';

  let token = '';
  let userId = '';
  let playlistId = '';

  beforeAll(async () => {
    await UserModel.deleteOne({ email });
    await request(app)
      .post('/api/auth/register')
      .send({ email, username, password, confirmPassword: password, role: 'user' })
      .expect(201);

    const loginRes = await request(app).post('/api/auth/login').send({ email, password }).expect(200);
    token = loginRes.body.token;
    userId = loginRes.body.data?._id;

    const pl = await PlaylistModel.create({ name: `Fav PL ${unique}`, createdBy: userId, visibility: 'public' });
    playlistId = pl._id.toString();
  });

  afterAll(async () => {
    await PlaylistModel.deleteOne({ _id: playlistId });
    await UserModel.deleteOne({ email });
  });

  test('POST /api/playlists/:id/favorite toggles favorite on', async () => {
    const res = await request(app)
      .post(`/api/playlists/${playlistId}/favorite`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('favorited', true);
  });

  test('GET /api/playlists/:id/favorited returns favorited true', async () => {
    const res = await request(app)
      .get(`/api/playlists/${playlistId}/favorited`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('favorited', true);
  });

  test('GET /api/playlists/user/favorited returns list', async () => {
    const res = await request(app)
      .get('/api/playlists/user/favorited')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /api/playlists/:id/favorite toggles favorite off', async () => {
    const res = await request(app)
      .post(`/api/playlists/${playlistId}/favorite`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('favorited', false);
  });
});
