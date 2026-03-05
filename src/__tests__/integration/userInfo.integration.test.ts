import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user_models/auth.model';

describe('UserInfo Integration Tests', () => {
  const unique = Date.now();
  const email = `ui_test_${unique}@test.com`;
  const username = `ui_test_${unique}`;
  const password = 'Test@1234';

  let token = '';
  let userId = '';

  beforeAll(async () => {
    await UserModel.deleteOne({ email });
    await request(app)
      .post('/api/auth/register')
      .send({ email, username, password, confirmPassword: password, role: 'user' })
      .expect(201);

    const loginRes = await request(app).post('/api/auth/login').send({ email, password }).expect(200);
    token = loginRes.body.token;
    userId = loginRes.body.data?._id;
  });

  afterAll(async () => {
    await UserModel.deleteOne({ email });
  });

  test('PUT /api/userInfo/add-info accepts valid phone and age', async () => {
    const payload = { phoneNumber: '1234567890', age: 30, city: 'Testville' };
    const res = await request(app)
      .put('/api/userInfo/add-info')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.additionalInfo).toMatchObject({ phoneNumber: '1234567890', age: 30, city: 'Testville' });
  });

  test('PUT /api/userInfo/add-info rejects invalid phone', async () => {
    const payload = { phoneNumber: 'abc-123' };
    const res = await request(app)
      .put('/api/userInfo/add-info')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(500);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Phone number|phoneNumber|digits/i);
  });

  test('GET /api/userInfo/get-info returns additional info', async () => {
    const res = await request(app)
      .get('/api/userInfo/get-info')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('phoneNumber');
  });

  test('DELETE /api/userInfo/clear-info clears info', async () => {
    const res = await request(app)
      .delete('/api/userInfo/clear-info')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.additionalInfo).toBeUndefined();
  });

  test('PUT /api/userInfo/add-info accepts valid gender and dateOfBirth string', async () => {
    const payload = { gender: 'other', dateOfBirth: '1990-05-15', bio: 'hello' };
    const res = await request(app)
      .put('/api/userInfo/add-info')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.additionalInfo).toMatchObject({ gender: 'other', bio: 'hello' });
    expect(res.body.data.additionalInfo.dateOfBirth).toBeDefined();
  });

  test('PUT /api/userInfo/add-info rejects invalid gender', async () => {
    const payload = { gender: 'not-a-valid-gender' };
    const res = await request(app)
      .put('/api/userInfo/add-info')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/gender/i);
  });

  test('PUT /api/userInfo/add-info rejects age out of bounds', async () => {
    const tooYoung = { age: -1 };
    const resYoung = await request(app)
      .put('/api/userInfo/add-info')
      .set('Authorization', `Bearer ${token}`)
      .send(tooYoung)
      .expect(400);
    expect(resYoung.body.success).toBe(false);

    const tooOld = { age: 200 };
    const resOld = await request(app)
      .put('/api/userInfo/add-info')
      .set('Authorization', `Bearer ${token}`)
      .send(tooOld)
      .expect(400);
    expect(resOld.body.success).toBe(false);
  });

  test('PUT /api/userInfo/add-info rejects bio exceeding max length', async () => {
    const longBio = 'a'.repeat(1000);
    const res = await request(app)
      .put('/api/userInfo/add-info')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: longBio })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/bio/i);
  });
});
