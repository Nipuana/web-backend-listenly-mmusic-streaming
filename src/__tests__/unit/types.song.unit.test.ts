import { songType } from '../../types/song_types/song.type';

describe('SongType schema unit tests', () => {
  test('valid song passes', () => {
    const parsed = songType.safeParse({ title: 'x', uploadedBy: 'u' });
    expect(parsed.success).toBe(true);
  });

  test('missing title fails', () => {
    const parsed = songType.safeParse({ uploadedBy: 'u' } as any);
    expect(parsed.success).toBe(false);
  });

  test('genre defaults to other', () => {
    const parsed = songType.parse({ title: 'x', uploadedBy: 'u' });
    expect(parsed.genre).toBeDefined();
  });

  test('duration must be positive if provided', () => {
    const parsed = songType.safeParse({ title: 'x', uploadedBy: 'u', duration: -5 });
    expect(parsed.success).toBe(false);
  });

  test('visibility accepts allowed values', () => {
    expect(songType.safeParse({ title: 'x', uploadedBy: 'u', visibility: 'private' }).success).toBe(true);
  });

  test('playCount cannot be negative', () => {
    const parsed = songType.safeParse({ title: 'x', uploadedBy: 'u', playCount: -1 });
    expect(parsed.success).toBe(false);
  });
});
