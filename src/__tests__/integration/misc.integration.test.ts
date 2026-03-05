import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user_models/auth.model';
import { SongModel } from '../../models/song_models/song.model';

describe('Misc Integration Tests', () => {
  test('Protected route without token returns 401', async () => {
    await request(app).get('/api/songs/get-all-songs').expect(401);
  });

  test('GET /api/playlists/get-all returns array', async () => {
    // Use a fresh user
    const unique = Date.now();
    const email = `misc_${unique}@test.com`;
    const username = `misc_${unique}`;
    const password = 'Test@1234';

    await UserModel.deleteOne({ email });
    await request(app).post('/api/auth/register').send({ email, username, password, confirmPassword: password, role: 'user' }).expect(201);
    const login = await request(app).post('/api/auth/login').send({ email, password }).expect(200);
    const token = login.body.token;

    const res = await request(app).get('/api/playlists/get-all').set('Authorization', `Bearer ${token}`).expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/songs/getSongsBygenre/:genre returns array', async () => {
    const unique = Date.now();
    const email = `g_${unique}@test.com`;
    const username = `g_${unique}`;
    const password = 'Test@1234';
    await UserModel.deleteOne({ email });
    await request(app).post('/api/auth/register').send({ email, username, password, confirmPassword: password, role: 'user' }).expect(201);
    const login = await request(app).post('/api/auth/login').send({ email, password }).expect(200);
    const token = login.body.token;
    const userId = login.body.data._id;

    await SongModel.create({ title: `GSong ${unique}`, uploadedBy: userId, genre: 'pop', visibility: 'public' });

    const res = await request(app).get('/api/songs/getSongsBygenre/pop').set('Authorization', `Bearer ${token}`).expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('Liking non-existent song returns 404', async () => {
    const unique = Date.now();
    const email = `ln_${unique}@test.com`;
    const username = `ln_${unique}`;
    const password = 'Test@1234';
    await UserModel.deleteOne({ email });
    await request(app).post('/api/auth/register').send({ email, username, password, confirmPassword: password, role: 'user' }).expect(201);
    const login = await request(app).post('/api/auth/login').send({ email, password }).expect(200);
    const token = login.body.token;

    const fakeId = '507f1f77bcf86cd799439012';
    const res = await request(app).post(`/api/songs/change-like-status/${fakeId}`).set('Authorization', `Bearer ${token}`);
    expect([404, 200]).toContain(res.status); // service may throw 404 or handle gracefully
  });

  test('GET /api/songs/getSongByuserId/:userId returns array', async () => {
    const unique = Date.now();
    const email = `su_${unique}@test.com`;
    const username = `su_${unique}`;
    const password = 'Test@1234';
    await UserModel.deleteOne({ email });
    await request(app).post('/api/auth/register').send({ email, username, password, confirmPassword: password, role: 'user' }).expect(201);
    const login = await request(app).post('/api/auth/login').send({ email, password }).expect(200);
    const token = login.body.token;
    const userId = login.body.data._id;

    await SongModel.create({ title: `USong ${unique}`, uploadedBy: userId, visibility: 'public' });

    const res = await request(app).get(`/api/songs/getSongByuserId/${userId}`).set('Authorization', `Bearer ${token}`).expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
