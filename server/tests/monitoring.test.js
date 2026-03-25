const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Order = require('../src/models/order.model');
const { monitorUserCancellationBehavior } = require('../src/services/cancellationMonitor.service');

jest.mock('../src/models/user.model');
jest.mock('../src/models/order.model');
jest.mock('../src/services/cancellationMonitor.service', () => ({
  monitorUserCancellationBehavior: jest.fn(),
}));

describe('Order monitoring and admin flagged users endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks non-admin users from viewing flagged users', async () => {
    User.findById.mockResolvedValue({ _id: 'user-1', role: 'user', flagged: false });

    const response = await request(app)
      .get('/api/admin/flagged-users')
      .set('x-user-id', 'user-1');

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Admin access required');
  });

  it('returns flagged users for admin', async () => {
    User.findById.mockResolvedValue({ _id: 'admin-1', role: 'admin', flagged: false });

    const flaggedUsers = [{ _id: 'u1', email: 'u1@example.com', role: 'user', flagged: true }];

    User.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(flaggedUsers),
      }),
    });

    const response = await request(app)
      .get('/api/admin/flagged-users')
      .set('x-user-id', 'admin-1');

    expect(response.statusCode).toBe(200);
    expect(response.body.count).toBe(1);
    expect(response.body.users).toEqual(flaggedUsers);
  });

  it('monitors cancellations when a buyer cancels an order', async () => {
    User.findById.mockResolvedValue({ _id: 'buyer-1', role: 'user', flagged: false });

    const save = jest.fn().mockResolvedValue(undefined);
    Order.findById.mockResolvedValue({
      _id: 'order-1',
      buyerId: { toString: () => 'buyer-1' },
      status: 'pending',
      cancellationReason: null,
      save,
    });

    monitorUserCancellationBehavior.mockResolvedValue({
      threshold: 3,
      cancellationCount: 4,
      shouldFlag: true,
    });

    const response = await request(app)
      .patch('/api/orders/order-1/cancel')
      .set('x-user-id', 'buyer-1')
      .send({ cancellationReason: 'Changed mind' });

    expect(response.statusCode).toBe(200);
    expect(save).toHaveBeenCalledTimes(1);
    expect(monitorUserCancellationBehavior).toHaveBeenCalledWith('buyer-1');
    expect(response.body.monitoring.shouldFlag).toBe(true);
  });
});
