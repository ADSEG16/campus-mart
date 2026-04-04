const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');
const { hashPassword } = require('../src/utils/hashPassword');

const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'msg-1' });

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
  })),
}), { virtual: true });

jest.mock('../src/models/user.model');

describe('Auth Routes', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'no-reply@example.com';
    process.env.SMTP_PASS = 'test-pass';
    process.env.SMTP_FROM = 'Campus Mart <no-reply@example.com>';
    process.env.APP_BASE_URL = 'http://localhost:5000';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user', async () => {
      User.findOne.mockResolvedValue(null);
      const save = jest.fn().mockResolvedValue(undefined);
      User.create.mockResolvedValue({
        _id: 'user-1',
        fullName: 'Test User',
        department: 'Computer Science',
        email: 'test@st.ug.edu.gh',
        graduationYear: 2026,
        role: 'user',
        verificationStatus: 'pending',
        studentIdUrl: null,
        profileImageUrl: null,
        bio: '',
        flagged: false,
        save,
      });

      const response = await request(app).post('/api/auth/signup').send({
        fullName: 'Test User',
        department: 'Computer Science',
        email: 'test@st.ug.edu.gh',
        graduationYear: 2026,
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toEqual(expect.any(String));
      expect(response.body.data.email).toBe('test@st.ug.edu.gh');
      expect(save).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(User.create).toHaveBeenCalledTimes(1);
    });

    it('should set verification token fields when signing up', async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: 'user-2',
        fullName: 'Test User Two',
        department: 'Computer Science',
        email: 'test2@st.ug.edu.gh',
        graduationYear: 2026,
        role: 'user',
        verificationStatus: 'pending',
        emailVerificationTokenHash: null,
        emailVerificationTokenExpiresAt: null,
        save,
      });

      const response = await request(app).post('/api/auth/signup').send({
        fullName: 'Test User Two',
        department: 'Computer Science',
        email: 'test2@st.ug.edu.gh',
        graduationYear: 2026,
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect(response.statusCode).toBe(201);
      expect(save).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalled();
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test2@st.ug.edu.gh',
        })
      );
    });

    it('should reject non-school email domains', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        fullName: 'Test User',
        department: 'Computer Science',
        email: 'test@gmail.com',
        graduationYear: 2026,
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Email must end with @st.ug.edu.gh');
    });

    it('should reject duplicate email', async () => {
      User.findOne.mockResolvedValue({ _id: 'existing-user' });

      const response = await request(app).post('/api/auth/signup').send({
        fullName: 'Test User',
        department: 'Computer Science',
        email: 'test@st.ug.edu.gh',
        graduationYear: 2026,
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect(response.statusCode).toBe(409);
      expect(response.body.message).toBe('Email already in use');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user with valid credentials', async () => {
      const password = 'password123';
      const hashedPassword = await hashPassword(password);

      User.findOne.mockResolvedValue({
        _id: 'user-1',
        fullName: 'Test User',
        department: 'Computer Science',
        email: 'test@st.ug.edu.gh',
        graduationYear: 2026,
        role: 'user',
        verificationStatus: 'pending',
        studentIdUrl: null,
        profileImageUrl: null,
        bio: '',
        flagged: false,
        password: hashedPassword,
        emailVerified: true,
      });

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@st.ug.edu.gh',
        password,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toEqual(expect.any(String));
      expect(response.body.data.email).toBe('test@st.ug.edu.gh');
    });

    it('should block login for unverified email', async () => {
      const password = 'password123';
      const hashedPassword = await hashPassword(password);

      User.findOne.mockResolvedValue({
        _id: 'user-1',
        email: 'test@st.ug.edu.gh',
        password: hashedPassword,
        emailVerified: false,
      });

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@st.ug.edu.gh',
        password,
      });

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe('Email is not verified. Please verify your email before logging in');
    });

    it('should reject invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@st.ug.edu.gh',
        password: 'wrong-password',
      });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('Email Verification', () => {
    it('should verify email when token is valid', async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      User.findOne.mockResolvedValue({
        _id: 'user-verify-1',
        email: 'verify@st.ug.edu.gh',
        emailVerified: false,
        emailVerificationTokenHash: 'hash',
        emailVerificationTokenExpiresAt: new Date(Date.now() + 60_000),
        save,
      });

      const response = await request(app)
        .get('/api/auth/verify-email')
        .query({ token: 'plain-token' });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Email verified successfully');
      expect(save).toHaveBeenCalledTimes(1);
    });

    it('should reject invalid or expired verification token', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/auth/verify-email')
        .query({ token: 'invalid-token' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Verification token is invalid or expired');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user when authenticated', async () => {
      User.findById.mockResolvedValue({
        _id: 'user-1',
        fullName: 'Test User',
        department: 'Computer Science',
        email: 'test@st.ug.edu.gh',
        graduationYear: 2026,
        role: 'user',
        verificationStatus: 'pending',
        studentIdUrl: null,
        profileImageUrl: null,
        bio: '',
        flagged: false,
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('x-user-id', 'user-1');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe('user-1');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Authentication required');
    });
  });
});
