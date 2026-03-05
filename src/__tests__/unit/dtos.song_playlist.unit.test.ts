import { CreateSongDto, TrackListenTimeDto } from '../../dtos/song _dtos/song.dtos';
import { CreatePlaylistDto, AddSongToPlaylistDto, ReorderSongsDto } from '../../dtos/playlist_dtos/playlist.dtos';

describe('Song & Playlist DTO unit tests', () => {
  test('CreateSongDto requires audioUrl and title', () => {
    const parsed = CreateSongDto.safeParse({ title: 's1', audioUrl: '/x.mp3' });
    expect(parsed.success).toBe(true);
  });

  test('CreateSongDto rejects missing audioUrl', () => {
    const parsed = CreateSongDto.safeParse({ title: 's1' });
    expect(parsed.success).toBe(false);
  });

  test('TrackListenTimeDto accepts nonnegative int', () => {
    const parsed = TrackListenTimeDto.safeParse({ seconds: 0 });
    expect(parsed.success).toBe(true);
  });

  test('TrackListenTimeDto rejects negative', () => {
    const parsed = TrackListenTimeDto.safeParse({ seconds: -1 });
    expect(parsed.success).toBe(false);
  });

  test('AddSongToPlaylistDto requires songId', () => {
    const parsed = AddSongToPlaylistDto.safeParse({ songId: '123' });
    expect(parsed.success).toBe(true);
  });

  test('AddSongToPlaylistDto rejects empty songId', () => {
    const parsed = AddSongToPlaylistDto.safeParse({ songId: '' });
    expect(parsed.success).toBe(false);
  });

  test('ReorderSongsDto accepts valid orders', () => {
    const parsed = ReorderSongsDto.safeParse({ songOrders: [{ songId: '1', position: 0 }] });
    expect(parsed.success).toBe(true);
  });

  test('ReorderSongsDto rejects empty array', () => {
    const parsed = ReorderSongsDto.safeParse({ songOrders: [] });
    expect(parsed.success).toBe(false);
  });
});
