import { CreateUserDto, LoginUserDto } from '../../dtos/user_dtos/auth.dtos';

describe('Auth DTO unit tests', () => {
  test('CreateUserDto accepts valid input', () => {
    const parsed = CreateUserDto.safeParse({ username: 'abc', email: 'a@b.com', password: 'secret', confirmPassword: 'secret' });
    expect(parsed.success).toBe(true);
  });

  test('CreateUserDto rejects mismatched password', () => {
    const parsed = CreateUserDto.safeParse({ username: 'abc', email: 'a@b.com', password: 'secret', confirmPassword: 'nope' });
    expect(parsed.success).toBe(false);
  });

  test('CreateUserDto rejects short username', () => {
    const parsed = CreateUserDto.safeParse({ username: 'ab', email: 'a@b.com', password: 'secret', confirmPassword: 'secret' });
    expect(parsed.success).toBe(false);
  });

  test('LoginUserDto accepts valid', () => {
    const parsed = LoginUserDto.safeParse({ email: 'x@y.com', password: '123456' });
    expect(parsed.success).toBe(true);
  });

  test('LoginUserDto rejects invalid email', () => {
    const parsed = LoginUserDto.safeParse({ email: 'not-an-email', password: '123456' });
    expect(parsed.success).toBe(false);
  });
});
