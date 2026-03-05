import { Utils } from '../../utils/common.utils';
import mongoose from 'mongoose';

describe('Utils unit tests', () => {
  test('toObjectId returns ObjectId', () => {
    const id = Utils.toObjectId('507f1f77bcf86cd799439011');
    expect(id).toBeInstanceOf(mongoose.Types.ObjectId);
  });

  test('hasRole returns true for matching role', () => {
    const user = { role: 'admin' };
    expect(Utils.hasRole(user, 'admin')).toBe(true);
  });

  test('hasRole returns false for non-matching role', () => {
    const user = { role: 'user' };
    expect(Utils.hasRole(user, 'admin')).toBe(false);
  });

  test('generateFileUrl creates expected path', () => {
    expect(Utils.generateFileUrl('images/pfp', 'me.png')).toBe('/uploads/images/pfp/me.png');
  });

  test('validateFilePresence throws when file missing', () => {
    expect(() => Utils.validateFilePresence(undefined, 'Audio')).toThrow('Audio is required');
  });

  test('validateFilePresence does not throw when file present', () => {
    expect(() => Utils.validateFilePresence({ filename: 'x' }, 'Audio')).not.toThrow();
  });
});
