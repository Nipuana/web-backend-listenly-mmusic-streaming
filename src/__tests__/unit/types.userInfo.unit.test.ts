import { userInfoType } from '../../types/user_types/userInfo.type';

describe('UserInfoType schema unit tests', () => {
  test('valid user info passes', () => {
    const parsed = userInfoType.safeParse({ phoneNumber: '1234567890' });
    expect(parsed.success).toBe(true);
  });

  test('age bounds enforced (negative)', () => {
    const parsed = userInfoType.safeParse({ age: -1 });
    expect(parsed.success).toBe(false);
  });

  test('age bounds enforced (too large)', () => {
    const parsed = userInfoType.safeParse({ age: 200 });
    expect(parsed.success).toBe(false);
  });

  test('bio max length enforced', () => {
    const long = 'a'.repeat(600);
    const parsed = userInfoType.safeParse({ bio: long });
    expect(parsed.success).toBe(false);
  });
});
