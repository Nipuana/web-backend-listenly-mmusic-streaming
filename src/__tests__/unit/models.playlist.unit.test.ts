import { PlaylistModel } from '../../models/playlist_models/playlist.model';

describe('PlaylistModel unit tests', () => {
  test('requires name', () => {
    const p = new PlaylistModel({ createdBy: '507f1f77bcf86cd799439011' });
    const err = p.validateSync();
    expect(err).toBeDefined();
    expect(Object.keys(err!.errors)).toContain('name');
  });

  test('name max length enforced', () => {
    const long = 'a'.repeat(200);
    const p = new PlaylistModel({ name: long, createdBy: '507f1f77bcf86cd799439011' });
    const err = p.validateSync();
    expect(err).toBeDefined();
  });

  test('visibility enum accepts public/private', () => {
    const p = new PlaylistModel({ name: 'x', createdBy: '507f1f77bcf86cd799439011', visibility: 'private' });
    const err = p.validateSync();
    expect(err).toBeUndefined();
  });

  test('favoriteCount defaults to 0', () => {
    const p = new PlaylistModel({ name: 'x', createdBy: '507f1f77bcf86cd799439011' });
    expect(p.favoriteCount).toBe(0);
  });

  test('songs schema requires songId and position when present', () => {
    const p = new PlaylistModel({ name: 'x', createdBy: '507f1f77bcf86cd799439011', songs: [{ songId: '507f1f77bcf86cd799439011', position: 0 }] });
    const err = p.validateSync();
    expect(err).toBeUndefined();
  });
});
