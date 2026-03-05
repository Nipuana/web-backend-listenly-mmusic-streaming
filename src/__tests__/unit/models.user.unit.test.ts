import { UserModel } from '../../models/user_models/auth.model';

describe('UserModel unit tests', () => {
  test('valid minimal user passes validation', () => {
    const u = new UserModel({ email: 'u@test.com', username: 'user1', password: 'secret' });
    const err = u.validateSync();
    expect(err).toBeUndefined();
  });

  test('missing required fields fails', () => {
    const u = new UserModel({});
    const err = u.validateSync();
    expect(err).toBeDefined();
    const keys = Object.keys(err!.errors);
    expect(keys).toEqual(expect.arrayContaining(['email', 'username', 'password']));
  });

  test('role enum accepts allowed values', () => {
    const u = new UserModel({ email: 'a@b.com', username: 'u1', password: 'p', role: 'artist' });
    const err = u.validateSync();
    expect(err).toBeUndefined();
  });

  test('additionalInfo.age must obey bounds', () => {
    const u = new UserModel({ email: 'a2@b.com', username: 'u2', password: 'p', additionalInfo: { age: 151 } });
    const err = u.validateSync();
    expect(err).toBeDefined();
    expect(Object.keys(err!.errors)).toContain('additionalInfo.age');
  });

  test('gender enum rejects invalid', () => {
    const u = new UserModel({ email: 'a3@b.com', username: 'u3', password: 'p', additionalInfo: { gender: 'invalid' as any } });
    const err = u.validateSync();
    expect(err).toBeDefined();
  });
});
