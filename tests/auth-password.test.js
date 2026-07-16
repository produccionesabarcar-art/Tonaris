jest.mock('../src/db/pool');
jest.mock('../src/middleware/rateLimiter', () => (req, res, next) => next());
jest.mock('../src/services/emailService', () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));

const request = require('supertest');
const pool = require('../src/db/pool');

const app = require('../src/app');

describe('POST /api/users/forgot-password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('envía email de recuperación si el email existe', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ email: 'test@example.com' }] })
      .mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app)
      .post('/api/users/forgot-password')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Si el correo existe');
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  it('devuelve mismo mensaje si el email no existe (seguridad)', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post('/api/users/forgot-password')
      .send({ email: 'noexiste@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Si el correo existe');
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it('rechaza solicitud sin email', async () => {
    const res = await request(app)
      .post('/api/users/forgot-password')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Email es obligatorio.' });
  });
});

describe('POST /api/users/reset-password', () => {
  const mockUser = {
    user_id: 'usr_test999',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('restablece la contraseña con token válido', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [mockUser] })
      .mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app)
      .post('/api/users/reset-password')
      .send({ token: 'valid_token_hex', newPassword: 'NewPass123' });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Contraseña actualizada');
  });

  it('rechaza token inválido o expirado', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post('/api/users/reset-password')
      .send({ token: 'invalid_token', newPassword: 'NewPass123' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Enlace inválido o expirado.' });
  });

  it('rechaza token o nueva contraseña faltantes', async () => {
    const res = await request(app)
      .post('/api/users/reset-password')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Token y nueva contraseña son obligatorios.' });
  });

  it('rechaza contraseña menor a 8 caracteres', async () => {
    const res = await request(app)
      .post('/api/users/reset-password')
      .send({ token: 'sometoken', newPassword: 'Ab1' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('8 caracteres');
  });

  it('rechaza contraseña igual al email del usuario', async () => {
    pool.query.mockResolvedValue({ rows: [mockUser] });

    const res = await request(app)
      .post('/api/users/reset-password')
      .send({ token: 'valid_token', newPassword: 'test@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('correo electrónico');
  });
});
