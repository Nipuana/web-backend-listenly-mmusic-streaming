import { SongModel } from '../../models/song_models/song.model';

describe('SongModel unit tests', () => {
  test('requires title', () => {
    const s = new SongModel({});
    const err = s.validateSync();
    expect(err).toBeDefined();
    expect(Object.keys(err!.errors)).toContain('title');
  });

  test('default values set for playCount and likeCount', () => {
    const s = new SongModel({ title: 't', uploadedBy: '507f1f77bcf86cd799439011' });
    const err = s.validateSync();
    expect(err).toBeUndefined();
    expect(s.playCount).toBeDefined();
    expect(s.likeCount).toBeDefined();
  });

  test('genre accepts allowed enum', () => {
    const s = new SongModel({ title: 't', uploadedBy: '507f1f77bcf86cd799439011', genre: 'pop' });
    const err = s.validateSync();
    expect(err).toBeUndefined();
  });

  test('genre rejects invalid value', () => {
    const s = new SongModel({ title: 't', uploadedBy: '507f1f77bcf86cd799439011', genre: 'dance' as any });
    const err = s.validateSync();
    expect(err).toBeDefined();
  });

  test('visibility enum default is public', () => {
    const s = new SongModel({ title: 't', uploadedBy: '507f1f77bcf86cd799439011' });
    expect(s.visibility).toBe('public');
  });

  test('listenTimeSeconds defaults to 0', () => {
    const s = new SongModel({ title: 't', uploadedBy: '507f1f77bcf86cd799439011' });
    expect(s.listenTimeSeconds).toBe(0);
  });

  test('uploadedBy is required', () => {
    const s = new SongModel({ title: 't' });
    const err = s.validateSync();
    expect(err).toBeDefined();
    expect(Object.keys(err!.errors)).toContain('uploadedBy');
  });
});
