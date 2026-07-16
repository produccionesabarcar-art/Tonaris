jest.mock('../src/db/pool');
jest.mock('../src/middleware/rateLimiter', () => (req, res, next) => next());
jest.mock('bcrypt');

const request = require('supertest');
const pool = require('../src/db/pool');
const bcrypt = require('bcrypt');

const app = require('../src/app');

describe('POST /api/users/login', () => {
  const validUser = {
    user_id: 'usr_test999',
    name: 'Test User',
    email: 'test@example.com',
    role: 'estudiante',
    password: '$2b$10$hashed_password_placeholder',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loguea un usuario exitosamente y devuelve token', async () => {
    pool.query.mockResolvedValue({ rows: [validUser] });
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'test@example.com', password: 'Test1234' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toEqual({
      user_id: validUser.user_id,
      name: validUser.name,
      email: validUser.email,
      role: validUser.role,
    });
  });

  it('rechaza login con email no registrado', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'unknown@example.com', password: 'Test1234' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Credenciales inválidas.' });
  });

  it('rechaza login con contraseña incorrecta', async () => {
    pool.query.mockResolvedValue({ rows: [validUser] });
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'test@example.com', password: 'WrongPass1' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Credenciales inválidas.' });
  });

  it('rechaza login con campos vacíos', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Email y contraseña son obligatorios.' });
  });
});
