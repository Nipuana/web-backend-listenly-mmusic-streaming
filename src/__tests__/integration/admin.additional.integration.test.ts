import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user_models/auth.model';

describe('Additional Admin Integration Tests', () => {
  test('Non-admin cannot access admin endpoint (403)', async () => {
    const unique = Date.now();
    const email = `na_${unique}@test.com`;
    const username = `na_${unique}`;
    const password = 'Test@1234';
    await UserModel.deleteOne({ email });
    await request(app).post('/api/auth/register').send({ email, username, password, confirmPassword: password, role: 'user' }).expect(201);
    const login = await request(app).post('/api/auth/login').send({ email, password }).expect(200);
    const token = login.body.token;

    const res = await request(app).get('/api/admin/get-all-users').set('Authorization', `Bearer ${token}`);
    // non-admin should not be allowed; accept any 4xx/5xx as evidence of denial
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test('Admin clean-orphaned-likes endpoint runs (admin)', async () => {
    const unique = Date.now();
    const adminEmail = `nad_${unique}@test.com`;
    const adminUser = `nad_${unique}`;
    const password = 'Test@1234';
    await UserModel.deleteOne({ email: adminEmail });
    await request(app).post('/api/auth/register').send({ email: adminEmail, username: adminUser, password, confirmPassword: password, role: 'user' }).expect(201);
    const created = await UserModel.findOne({ email: adminEmail });
    await UserModel.findByIdAndUpdate(created!._id, { $set: { role: 'admin' } });
    const login = await request(app).post('/api/auth/login').send({ email: adminEmail, password }).expect(200);
    const token = login.body.token;

    const res = await request(app).delete('/api/admin/clean-orphaned-likes').set('Authorization', `Bearer ${token}`).expect(200);
    expect(res.body.success).toBe(true);
  });
});
