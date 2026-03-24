const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');
const { hashPassword } = require('../src/utils/hashPassword');

jest.mock('../src/models/user.model');

describe('Auth Routes', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user', async () => {
      User.findOne.mockResolvedValue(null);
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
      expect(User.create).toHaveBeenCalledTimes(1);
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
