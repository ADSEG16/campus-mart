const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');

jest.mock('../src/models/user.model');

describe('User profile patch authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks non-admin from patching admin-only schema fields', async () => {
    User.findById
      .mockResolvedValueOnce({ _id: 'user-1', role: 'user' })
      .mockResolvedValueOnce({ _id: 'user-1', role: 'user', save: jest.fn() });

    const response = await request(app)
      .patch('/api/users/profile')
      .set('x-user-id', 'user-1')
      .send({ role: 'admin' });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Unauthorized profile fields in patch request');
    expect(response.body.unauthorizedFields).toEqual(['role']);
  });

  it('allows non-admin to patch allowed profile fields', async () => {
    const save = jest.fn().mockResolvedValue(undefined);

    User.findById
      .mockResolvedValueOnce({ _id: 'user-1', role: 'user' })
      .mockResolvedValueOnce({
        _id: 'user-1',
        role: 'user',
        fullName: 'Old Name',
        bio: '',
        save,
      });

    const response = await request(app)
      .patch('/api/users/profile')
      .set('x-user-id', 'user-1')
      .send({ fullName: 'New Name', bio: 'Hello there' });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('User profile updated successfully');
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('allows admin to patch admin-only profile fields', async () => {
    const save = jest.fn().mockResolvedValue(undefined);

    User.findById
      .mockResolvedValueOnce({ _id: 'admin-1', role: 'admin' })
      .mockResolvedValueOnce({
        _id: 'admin-1',
        role: 'admin',
        trustScore: 50,
        flagged: false,
        save,
      });

    const response = await request(app)
      .patch('/api/users/profile')
      .set('x-user-id', 'admin-1')
      .send({ trustScore: 88, flagged: true });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('User profile updated successfully');
    expect(save).toHaveBeenCalledTimes(1);
  });
});
