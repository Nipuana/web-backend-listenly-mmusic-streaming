import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user_models/auth.model';
import { SongModel } from '../../models/song_models/song.model';
import { PlaylistModel } from '../../models/playlist_models/playlist.model';

describe('Playlist Integration Tests', () => {
  const unique = Date.now();
  const email = `pl_test_${unique}@test.com`;
  const username = `pl_test_${unique}`;
  const password = 'Test@1234';

  let token = '';
  let userId = '';
  let songIds: string[] = [];
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

    const songs = await SongModel.create([
      { title: `PL Song 1 ${unique}`, uploadedBy: userId, visibility: 'public' },
      { title: `PL Song 2 ${unique}`, uploadedBy: userId, visibility: 'public' },
      { title: `PL Song 3 ${unique}`, uploadedBy: userId, visibility: 'public' },
    ]);
    songIds = songs.map(s => s._id.toString());
  });

  afterAll(async () => {
    await PlaylistModel.deleteMany({ createdBy: userId });
    await SongModel.deleteMany({ uploadedBy: userId });
    await UserModel.deleteOne({ email });
  });

  test('POST /api/playlists/create-playlist creates a playlist', async () => {
    const res = await request(app)
      .post('/api/playlists/create-playlist')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `My Playlist ${unique}`, description: 'test playlist', visibility: 'public' })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    playlistId = res.body.data._id;
  });

  test('POST /api/playlists/:id/songs adds a song to playlist', async () => {
    const res = await request(app)
      .post(`/api/playlists/${playlistId}/songs`)
      .set('Authorization', `Bearer ${token}`)
      .send({ songId: songIds[0], position: 0 })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.songs).toEqual(expect.arrayContaining([expect.objectContaining({ songId: expect.any(String) })]));
  });

  test('DELETE /api/playlists/remove-song-from-playlist/:id/:songId removes a song', async () => {
    // ensure song added first
    await request(app)
      .post(`/api/playlists/${playlistId}/songs`)
      .set('Authorization', `Bearer ${token}`)
      .send({ songId: songIds[1], position: 1 })
      .expect(200);

    const res = await request(app)
      .delete(`/api/playlists/remove-song-from-playlist/${playlistId}/${songIds[1]}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.songs.find((s: any) => s.songId === songIds[1])).toBeUndefined();
  });

  test('PUT /api/playlists/reorder-songs/:id reorders songs', async () => {
    // add two songs
    await request(app)
      .post(`/api/playlists/${playlistId}/songs`)
      .set('Authorization', `Bearer ${token}`)
      .send({ songId: songIds[1], position: 1 })
      .expect(200);

    const res = await request(app)
      .put(`/api/playlists/reorder-songs/${playlistId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ songOrders: [ { songId: songIds[1], position: 0 }, { songId: songIds[0], position: 1 } ] })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.songs[0].position).toBe(0);
  });

  test('GET /api/playlists/getPlaylistById/:id returns playlist', async () => {
    const res = await request(app)
      .get(`/api/playlists/getPlaylistById/${playlistId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('name');
  });

  test('DELETE /api/playlists/delete-playlist/:id deletes playlist', async () => {
    const res = await request(app)
      .delete(`/api/playlists/delete-playlist/${playlistId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });
});
