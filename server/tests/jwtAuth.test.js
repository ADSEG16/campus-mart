const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { verifyJWT } = require('../src/middleware/auth.middleware');
const User = require('../src/models/user.model');

jest.mock('../src/models/user.model');
jest.mock('../src/utils/response', () => ({
  sendError: jest.fn((res, { statusCode, message }) => {
    res.statusCode = statusCode;
    res.body = { message };
    return res;
  }),
}));

const TEST_SECRET = 'test_secret';
const mockUserId = new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa');

const generateToken = (payload, secret = TEST_SECRET, options = {}) =>
  jwt.sign(payload, secret, { expiresIn: '1h', ...options });

describe('CMP-22: verifyJWT Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    process.env.JWT_SECRET = TEST_SECRET;
    req = { header: jest.fn() };
    res = { statusCode: null, body: null };
    next = jest.fn();

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: mockUserId,
        role: 'user',
      }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('✅ Calls next() and attaches user ID and role when token is valid', async () => {
    const token = generateToken({ id: String(mockUserId) });
    req.header.mockReturnValue(`Bearer ${token}`);

    await verifyJWT(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ role: 'user' });
    expect(req.user._id).toBeDefined();
  });

  test('🚫 Returns 401 when Authorization header is missing', async () => {
    req.header.mockReturnValue(null);

    await verifyJWT(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Access denied. No token provided.');
    expect(next).not.toHaveBeenCalled();
  });

  test('🚫 Returns 401 when token does not start with Bearer', async () => {
    req.header.mockReturnValue('Token abc123');

    await verifyJWT(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Access denied. No token provided.');
    expect(next).not.toHaveBeenCalled();
  });

  test('🚫 Returns 401 when token is invalid', async () => {
    req.header.mockReturnValue('Bearer invalidtoken123');

    await verifyJWT(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid token.');
    expect(next).not.toHaveBeenCalled();
  });

  test('🚫 Returns 401 when token is expired', async () => {
    const expiredToken = generateToken(
      { id: String(mockUserId) },
      TEST_SECRET,
      { expiresIn: '-1s' }
    );
    req.header.mockReturnValue(`Bearer ${expiredToken}`);

    await verifyJWT(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Token has expired.');
    expect(next).not.toHaveBeenCalled();
  });

  test('🚫 Returns 401 when token is signed with wrong secret', async () => {
    const token = generateToken({ id: String(mockUserId) }, 'wrong_secret');
    req.header.mockReturnValue(`Bearer ${token}`);

    await verifyJWT(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid token.');
    expect(next).not.toHaveBeenCalled();
  });

  test('🚫 Returns 401 when user no longer exists in database', async () => {
    const token = generateToken({ id: String(mockUserId) });
    req.header.mockReturnValue(`Bearer ${token}`);
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await verifyJWT(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('User no longer exists.');
    expect(next).not.toHaveBeenCalled();
  });

  test('✅ Only attaches _id and role to req.user, not full user document', async () => {
    const token = generateToken({ id: String(mockUserId) });
    req.header.mockReturnValue(`Bearer ${token}`);

    await verifyJWT(req, res, next);

    expect(Object.keys(req.user)).toEqual(['_id', 'role']);
  });
});