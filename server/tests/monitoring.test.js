const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Order = require('../src/models/order.model');
const AuditEvent = require('../src/models/auditEvent.model');
const Product = require('../src/models/product.model');
const { monitorUserCancellationBehavior } = require('../src/services/cancellationMonitor.service');
const {
  monitorUserCancellationBehavior: realMonitorUserCancellationBehavior,
} = jest.requireActual('../src/services/cancellationMonitor.service');
const {
  applyCancellationTrustScore: realApplyCancellationTrustScore,
  TRUST_SCORE_RULES,
} = jest.requireActual('../src/services/trustScore.service');

jest.mock('../src/models/user.model');
jest.mock('../src/models/order.model');
jest.mock('../src/models/auditEvent.model', () => ({
  create: jest.fn(),
  find: jest.fn(),
}));
jest.mock('../src/models/product.model', () => ({
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));
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

  it('writes audit record when admin approves verification', async () => {
    User.findById
      .mockResolvedValueOnce({ _id: 'admin-1', role: 'admin' })
      .mockResolvedValueOnce({
        _id: 'user-1',
        studentIdUrl: 'https://cdn.example.com/id.pdf',
        verificationStatus: 'pending',
        isVerified: false,
        save: jest.fn().mockResolvedValue(undefined),
      });

    const response = await request(app)
      .patch('/api/admin/users/user-1/verify')
      .set('x-user-id', 'admin-1');

    expect(response.statusCode).toBe(200);
    expect(AuditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'moderation.verification_approved',
        actorId: 'admin-1',
        entityType: 'user',
        entityId: 'user-1',
      })
    );
  });

  it('writes audit record when admin rejects verification', async () => {
    User.findById
      .mockResolvedValueOnce({ _id: 'admin-1', role: 'admin' })
      .mockResolvedValueOnce({
        _id: 'user-2',
        studentIdUrl: 'https://cdn.example.com/id2.pdf',
        verificationStatus: 'pending',
        isVerified: false,
        save: jest.fn().mockResolvedValue(undefined),
      });

    const response = await request(app)
      .patch('/api/admin/users/user-2/reject')
      .set('x-user-id', 'admin-1');

    expect(response.statusCode).toBe(200);
    expect(AuditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'moderation.verification_rejected',
        actorId: 'admin-1',
        entityType: 'user',
        entityId: 'user-2',
      })
    );
  });

  it('returns verification queue for admin', async () => {
    User.findById.mockResolvedValue({ _id: 'admin-1', role: 'admin', flagged: false });

    const queue = [
      {
        _id: 'user-queue-1',
        fullName: 'Queue User',
        email: 'queue@st.ug.edu.gh',
        verificationStatus: 'pending',
      },
    ];

    User.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(queue),
      }),
    });

    const response = await request(app)
      .get('/api/admin/verification-queue')
      .set('x-user-id', 'admin-1');

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(queue);
  });

  it('returns recent moderation activity for admin', async () => {
    User.findById.mockResolvedValue({ _id: 'admin-1', role: 'admin', flagged: false });

    const events = [
      {
        _id: 'event-1',
        eventType: 'admin.listing_removed',
        entityType: 'listing',
      },
    ];

    AuditEvent.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(events),
        }),
      }),
    });

    const response = await request(app)
      .get('/api/admin/activity')
      .set('x-user-id', 'admin-1');

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(events);
  });

  it('removes listing and writes audit record for admin', async () => {
    User.findById.mockResolvedValue({ _id: 'admin-1', role: 'admin', flagged: false });

    const listingId = '507f1f77bcf86cd799439011';
    Product.findById.mockResolvedValue({
      _id: listingId,
      title: 'Old Book',
      sellerId: 'seller-1',
    });
    Product.findByIdAndDelete.mockResolvedValue({ _id: listingId });

    const response = await request(app)
      .delete(`/api/admin/listings/${listingId}`)
      .set('x-user-id', 'admin-1')
      .send({ reason: 'Unsafe item' });

    expect(response.statusCode).toBe(200);
    expect(response.body.listingId).toBe(listingId);
    expect(AuditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'admin.listing_removed',
        actorId: 'admin-1',
        entityType: 'listing',
        entityId: listingId,
      })
    );
  });

  it('applies 7-day threshold rule when monitoring cancellations', async () => {
    process.env.CANCELLATION_FLAG_THRESHOLD = '3';
    Order.countDocuments.mockResolvedValue(3);
    User.findByIdAndUpdate.mockResolvedValue({ _id: 'buyer-1', flagged: true });

    const monitoring = await realMonitorUserCancellationBehavior('buyer-1');

    expect(Order.countDocuments).toHaveBeenCalledWith(
      expect.objectContaining({
        updatedAt: expect.objectContaining({
          $gte: expect.any(Date),
        }),
      })
    );

    const queryArg = Order.countDocuments.mock.calls[0][0];
    const diffMs = Date.now() - queryArg.updatedAt.$gte.getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    expect(diffMs).toBeGreaterThanOrEqual(sevenDaysMs - 1000);
    expect(diffMs).toBeLessThanOrEqual(sevenDaysMs + 1000);
    expect(monitoring.shouldFlag).toBe(true);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('buyer-1', { flagged: true });

    delete process.env.CANCELLATION_FLAG_THRESHOLD;
  });

  it('auto-flags user when trust score falls below threshold', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    User.findById.mockResolvedValue({
      _id: 'buyer-1',
      trustScore: TRUST_SCORE_RULES.LOW_TRUST_FLAG_THRESHOLD + 1,
      flagged: false,
      save,
    });

    const result = await realApplyCancellationTrustScore('buyer-1');

    expect(save).toHaveBeenCalledTimes(1);
    expect(result.actor.trustScore).toBe(TRUST_SCORE_RULES.LOW_TRUST_FLAG_THRESHOLD + 1 - TRUST_SCORE_RULES.CANCELLATION_PENALTY);
    expect(result.actor.flagged).toBe(true);
  });

  it('returns deterministic orders-by-status analytics for admin', async () => {
    User.findById.mockResolvedValue({ _id: 'admin-1', role: 'admin', flagged: false });
    Order.aggregate.mockResolvedValue([
      { status: 'Cancelled', count: 2 },
      { status: 'Delivered', count: 5 },
    ]);

    const response = await request(app)
      .get('/api/admin/analytics/orders-by-status')
      .set('x-user-id', 'admin-1');

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual([
      { status: 'Cancelled', count: 2 },
      { status: 'Delivered', count: 5 },
    ]);
  });

  it('returns deterministic cancellations trend analytics for admin', async () => {
    User.findById.mockResolvedValue({ _id: 'admin-1', role: 'admin', flagged: false });
    Order.aggregate.mockResolvedValue([
      { date: '2026-04-01', count: 1 },
      { date: '2026-04-02', count: 3 },
    ]);

    const response = await request(app)
      .get('/api/admin/analytics/cancellations-trend?days=7')
      .set('x-user-id', 'admin-1');

    expect(response.statusCode).toBe(200);
    expect(response.body.days).toBe(7);
    expect(response.body.data).toEqual([
      { date: '2026-04-01', count: 1 },
      { date: '2026-04-02', count: 3 },
    ]);
    expect(Order.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          $match: expect.objectContaining({
            status: { $in: ['cancelled', 'Cancelled'] },
          }),
        }),
      ])
    );
  });

  it('returns deterministic flagged users trend analytics for admin', async () => {
    User.findById.mockResolvedValue({ _id: 'admin-1', role: 'admin', flagged: false });
    User.aggregate.mockResolvedValue([
      { date: '2026-04-01', count: 2 },
      { date: '2026-04-02', count: 4 },
    ]);

    const response = await request(app)
      .get('/api/admin/analytics/flagged-users-trend?days=7')
      .set('x-user-id', 'admin-1');

    expect(response.statusCode).toBe(200);
    expect(response.body.days).toBe(7);
    expect(response.body.data).toEqual([
      { date: '2026-04-01', count: 2 },
      { date: '2026-04-02', count: 4 },
    ]);
  });

  it('exports orders-by-status analytics as CSV', async () => {
    User.findById.mockResolvedValue({ _id: 'admin-1', role: 'admin', flagged: false });
    Order.aggregate.mockResolvedValue([
      { status: 'Cancelled', count: 2 },
      { status: 'Delivered', count: 5 },
    ]);

    const response = await request(app)
      .get('/api/admin/analytics/orders-by-status/export.csv')
      .set('x-user-id', 'admin-1');

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/csv');
    expect(response.text).toContain('status,count');
    expect(response.text).toContain('Cancelled,2');
    expect(response.text).toContain('Delivered,5');
  });
});
