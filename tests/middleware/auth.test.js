jest.mock('jsonwebtoken');

const jwt = require('jsonwebtoken');
const { authenticate, authorizeAdmin } = require('../../src/middleware/auth');

describe('authenticate middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('llama next() y asigna req.user con token válido', () => {
    const decoded = { user_id: 'usr_test', role: 'estudiante' };
    jwt.verify.mockReturnValue(decoded);

    req.headers.authorization = 'Bearer valid_token';

    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid_token', process.env.JWT_SECRET);
    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responde 401 si no hay token', () => {
    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token requerido.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('responde 403 si el token es inválido o expirado', () => {
    jwt.verify.mockImplementation(() => { throw new Error('jwt malformed'); });

    req.headers.authorization = 'Bearer invalid_token';

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado.' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('authorizeAdmin middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('llama next() si el usuario es admin', () => {
    req.user = { user_id: 'usr_admin', role: 'admin' };

    authorizeAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responde 403 si el usuario no es admin', () => {
    req.user = { user_id: 'usr_test', role: 'estudiante' };

    authorizeAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Acceso restringido a administradores.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('responde 403 si no hay usuario en req', () => {
    authorizeAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Acceso restringido a administradores.' });
    expect(next).not.toHaveBeenCalled();
  });
});
