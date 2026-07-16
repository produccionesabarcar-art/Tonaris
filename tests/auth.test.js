jest.mock('../src/db/pool');
jest.mock('../src/middleware/rateLimiter', () => (req, res, next) => next());

const request = require('supertest');
const pool = require('../src/db/pool');

const app = require('../src/app');

describe('POST /api/users/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registra un usuario exitosamente', async () => {
    const mockUser = {
      user_id: 'usr_test123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'estudiante',
      institution: null,
      created_at: new Date().toISOString(),
    };

    pool.query.mockResolvedValue({ rows: [mockUser] });

    const res = await request(app)
      .post('/api/users/register')
      .send({
        user_id: 'usr_test123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test1234',
      });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(mockUser);
  });

  it('rechaza registro con campos vacíos', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Faltan campos obligatorios.' });
  });

  it('rechaza registro con contraseña débil (< 8 chars, sin mayúscula, sin número)', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        user_id: 'usr_test456',
        name: 'Test',
        email: 'test@example.com',
        password: 'abc',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('contraseña');
  });

  it('rechaza email duplicado (error 23505)', async () => {
    pool.query.mockRejectedValue({ code: '23505' });

    const res = await request(app)
      .post('/api/users/register')
      .send({
        user_id: 'usr_test789',
        name: 'Test',
        email: 'existing@example.com',
        password: 'Test1234',
      });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'El email ya está registrado.' });
  });
});
