import { playlistType } from '../../types/playlist_types/playlist.type';

describe('PlaylistType schema unit tests', () => {
  test('valid playlist passes', () => {
    const parsed = playlistType.safeParse({ name: 'p', createdBy: 'u' });
    expect(parsed.success).toBe(true);
  });

  test('name required', () => {
    const parsed = playlistType.safeParse({ createdBy: 'u' } as any);
    expect(parsed.success).toBe(false);
  });

  test('name max length enforced', () => {
    const long = 'a'.repeat(200);
    const parsed = playlistType.safeParse({ name: long, createdBy: 'u' });
    expect(parsed.success).toBe(false);
  });

  test('favoriteCount defaults non-negative', () => {
    const parsed = playlistType.parse({ name: 'p', createdBy: 'u' });
    expect(parsed.favoriteCount).toBeGreaterThanOrEqual(0);
  });

  test('songs default to array', () => {
    const parsed = playlistType.parse({ name: 'p', createdBy: 'u' });
    expect(Array.isArray(parsed.songs)).toBe(true);
  });
});
