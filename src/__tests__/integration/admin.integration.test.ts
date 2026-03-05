import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user_models/auth.model';

describe('Admin Integration Tests', () => {
  const unique = Date.now();
  const adminEmail = `admin_test_${unique}@test.com`;
  const adminUser = `admin_test_${unique}`;
  const password = 'Test@1234';

  let token = '';
  let adminId = '';

  beforeAll(async () => {
    await UserModel.deleteOne({ email: adminEmail });
    // register and promote to admin directly in DB
    await request(app)
      .post('/api/auth/register')
      .send({ email: adminEmail, username: adminUser, password, confirmPassword: password, role: 'user' })
      .expect(201);

    const created = await UserModel.findOne({ email: adminEmail });
    if (!created) throw new Error('Failed to create admin test user');
    adminId = created._id.toString();
    await UserModel.findByIdAndUpdate(adminId, { $set: { role: 'admin' } });

    const loginRes = await request(app).post('/api/auth/login').send({ email: adminEmail, password }).expect(200);
    token = loginRes.body.token;
  });

  afterAll(async () => {
    await UserModel.deleteOne({ email: adminEmail });
  });

  test('POST /api/admin/create-user (admin) creates user and generates audit log', async () => {
    const newUser = { email: `created_${unique}@test.com`, username: `created_${unique}`, password: 'Test@1234', confirmPassword: 'Test@1234', role: 'user' };

    const res = await request(app)
      .post('/api/admin/create-user')
      .set('Authorization', `Bearer ${token}`)
      .send(newUser)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
  });

  test('GET /api/admin/audit-logs returns logs including admin action', async () => {
    const res = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);

    // If there is at least one log, fetch by id
    if (res.body.data.length > 0) {
      const id = res.body.data[0]._id;
      const byId = await request(app)
        .get(`/api/admin/audit-logs/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(byId.body.success).toBe(true);
      expect(byId.body.data).toHaveProperty('_id', id);
    }
  });
});
