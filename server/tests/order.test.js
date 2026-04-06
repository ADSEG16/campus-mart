const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Order = require('../src/models/order.model');
const Product = require('../src/models/product.model');
const AuditEvent = require('../src/models/auditEvent.model');
const Review = require('../src/models/review.model');
const { monitorUserCancellationBehavior } = require('../src/services/cancellationMonitor.service');
const {
  applySuccessfulDeliveryTrustScore,
  applyCancellationTrustScore,
  applyReviewTrustScore,
} = require('../src/services/trustScore.service');
const { ORDER_STATUS } = require('../src/constants/order.status');

jest.mock('../src/models/user.model');
jest.mock('../src/models/order.model');
jest.mock('../src/models/product.model');
jest.mock('../src/models/review.model');
jest.mock('../src/models/auditEvent.model', () => ({
  create: jest.fn(),
}));
jest.mock('../src/services/cancellationMonitor.service', () => ({
  monitorUserCancellationBehavior: jest.fn(),
}));
jest.mock('../src/services/trustScore.service', () => ({
  applySuccessfulDeliveryTrustScore: jest.fn(),
  applyCancellationTrustScore: jest.fn(),
  applyReviewTrustScore: jest.fn(),
}));

const createOrderFindQueryMock = (result) => ({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockResolvedValue(result),
});

const createOrderDetailQueryMock = (result) => ({
  populate: jest.fn().mockReturnThis(),
  then: (resolve) => Promise.resolve(resolve(result)),
  catch: (reject) => Promise.resolve(result).catch(reject),
});

describe('Order routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an order successfully', async () => {
    User.findById.mockResolvedValue({ _id: 'buyer-1', role: 'user' });

    Product.find.mockResolvedValue([
      {
        _id: 'product-1',
        sellerId: 'seller-1',
        availabilityStatus: 'Available',
        stock: 5,
        price: 20,
        title: 'Biology Book',
      },
    ]);

    Product.findOneAndUpdate.mockResolvedValue({
      _id: 'product-1',
      stock: 3,
      availabilityStatus: 'Available',
    });

    Order.create.mockResolvedValue({
      _id: 'order-1',
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      status: ORDER_STATUS.PENDING,
      totalAmount: 40,
    });

    const response = await request(app)
      .post('/api/orders')
      .set('x-user-id', 'buyer-1')
      .send({
        items: [{ productId: 'product-1', quantity: 2 }],
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Order created successfully');
    expect(Order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        totalAmount: 40,
        status: ORDER_STATUS.PENDING,
      })
    );
  });

  it('rejects creating order for own product', async () => {
    User.findById.mockResolvedValue({ _id: 'buyer-1', role: 'user' });

    Product.find.mockResolvedValue([
      {
        _id: 'product-1',
        sellerId: 'buyer-1',
        availabilityStatus: 'Available',
        stock: 2,
        price: 10,
        title: 'Own Product',
      },
    ]);

    const response = await request(app)
      .post('/api/orders')
      .set('x-user-id', 'buyer-1')
      .send({
        items: [{ productId: 'product-1', quantity: 1 }],
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('You cannot create an order for your own product');
    expect(Order.create).not.toHaveBeenCalled();
  });

  it('lists orders for buyer role with pagination', async () => {
    User.findById.mockResolvedValue({ _id: 'buyer-1', role: 'user' });

    const orders = [{ _id: 'order-1', buyerId: 'buyer-1' }];
    Order.find.mockReturnValue(createOrderFindQueryMock(orders));
    Order.countDocuments.mockResolvedValue(1);

    const response = await request(app)
      .get('/api/orders?role=buyer&page=1&limit=10')
      .set('x-user-id', 'buyer-1');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.pagination.total).toBe(1);
    expect(Order.find).toHaveBeenCalledWith({ buyerId: 'buyer-1' });
  });

  it('blocks order detail for non-participants', async () => {
    User.findById.mockResolvedValue({ _id: 'user-x', role: 'user' });

    Order.findById.mockReturnValue(
      createOrderDetailQueryMock({
        _id: 'order-1',
        buyerId: { _id: 'buyer-1' },
        sellerId: { _id: 'seller-1' },
      })
    );

    const response = await request(app)
      .get('/api/orders/order-1')
      .set('x-user-id', 'user-x');

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Not allowed to view this order');
  });

  it('blocks Delivered transition when both confirmations are not set', async () => {
    User.findById.mockResolvedValue({ _id: 'buyer-1', role: 'user' });

    const save = jest.fn().mockResolvedValue(undefined);
    const orderDoc = {
      _id: 'order-1',
      buyerId: { toString: () => 'buyer-1' },
      sellerId: { toString: () => 'seller-1' },
      status: ORDER_STATUS.MEETUP_SCHEDULED,
      buyerConfirmed: false,
      sellerConfirmed: false,
      cancellationReason: null,
      cancelledBy: null,
      save,
    };

    Order.findById.mockResolvedValue(orderDoc);

    const response = await request(app)
      .patch('/api/orders/order-1/status')
      .set('x-user-id', 'buyer-1')
      .send({ nextStatus: ORDER_STATUS.DELIVERED });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      'Both buyer and seller must confirm delivery before marking order as Delivered'
    );
    expect(orderDoc.status).toBe(ORDER_STATUS.MEETUP_SCHEDULED);
    expect(orderDoc.buyerConfirmed).toBe(false);
    expect(orderDoc.sellerConfirmed).toBe(false);
    expect(save).not.toHaveBeenCalled();
    expect(AuditEvent.create).not.toHaveBeenCalled();
    expect(applySuccessfulDeliveryTrustScore).not.toHaveBeenCalled();
    expect(applyCancellationTrustScore).not.toHaveBeenCalled();
    expect(monitorUserCancellationBehavior).not.toHaveBeenCalled();
  });

  it('blocks seller acceptance/rejection after 48 hours for pending orders', async () => {
    User.findById.mockResolvedValue({ _id: 'seller-1', role: 'user' });

    const save = jest.fn().mockResolvedValue(undefined);
    const orderDoc = {
      _id: 'order-1',
      buyerId: { toString: () => 'buyer-1' },
      sellerId: { toString: () => 'seller-1' },
      status: ORDER_STATUS.PENDING,
      buyerConfirmed: false,
      sellerConfirmed: false,
      createdAt: new Date(Date.now() - 49 * 60 * 60 * 1000),
      save,
    };

    Order.findById.mockResolvedValue(orderDoc);

    const response = await request(app)
      .patch('/api/orders/order-1/status')
      .set('x-user-id', 'seller-1')
      .send({
        nextStatus: ORDER_STATUS.MEETUP_SCHEDULED,
        meetupType: 'verified',
        meetupLocation: 'UG Library Entrance',
        meetupScheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

    expect(response.statusCode).toBe(422);
    expect(response.body.message).toBe('Seller acceptance or rejection window has expired for this pending order');
    expect(save).not.toHaveBeenCalled();
  });

  it('records buyer delivery confirmation through confirm-delivery endpoint', async () => {
    User.findById.mockResolvedValue({ _id: 'buyer-1', role: 'user' });

    const save = jest.fn().mockResolvedValue(undefined);
    const orderDoc = {
      _id: 'order-1',
      buyerId: { toString: () => 'buyer-1' },
      sellerId: { toString: () => 'seller-1' },
      status: ORDER_STATUS.MEETUP_SCHEDULED,
      buyerConfirmed: false,
      sellerConfirmed: false,
      save,
    };

    Order.findById.mockResolvedValue(orderDoc);

    const response = await request(app)
      .patch('/api/orders/order-1/confirm-delivery')
      .set('x-user-id', 'buyer-1');

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Delivery confirmation updated successfully');
    expect(orderDoc.buyerConfirmed).toBe(true);
    expect(orderDoc.sellerConfirmed).toBe(false);
    expect(save).toHaveBeenCalledTimes(1);
    expect(AuditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'order.delivery_confirmation_recorded',
        actorId: 'buyer-1',
        entityType: 'order',
        entityId: 'order-1',
      })
    );
  });

  it('applies trust reward after both sides confirm and status moves to Delivered', async () => {
    User.findById.mockResolvedValue({ _id: 'seller-1', role: 'user' });

    const save = jest.fn().mockResolvedValue(undefined);
    const orderDoc = {
      _id: 'order-1',
      buyerId: { toString: () => 'buyer-1' },
      sellerId: { toString: () => 'seller-1' },
      status: ORDER_STATUS.MEETUP_SCHEDULED,
      buyerConfirmed: true,
      sellerConfirmed: false,
      cancellationReason: null,
      cancelledBy: null,
      save,
    };

    Order.findById.mockResolvedValue(orderDoc);
    applySuccessfulDeliveryTrustScore.mockResolvedValue({ event: 'delivered' });

    const confirmResponse = await request(app)
      .patch('/api/orders/order-1/confirm-delivery')
      .set('x-user-id', 'seller-1');

    expect(confirmResponse.statusCode).toBe(200);
    expect(orderDoc.sellerConfirmed).toBe(true);

    const response = await request(app)
      .patch('/api/orders/order-1/status')
      .set('x-user-id', 'seller-1')
      .send({ nextStatus: ORDER_STATUS.DELIVERED });

    expect(response.statusCode).toBe(200);
    expect(save).toHaveBeenCalledTimes(2);
    expect(orderDoc.status).toBe(ORDER_STATUS.DELIVERED);
    expect(orderDoc.sellerConfirmed).toBe(true);
    expect(AuditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'order.status_changed',
        actorId: 'seller-1',
        entityType: 'order',
        entityId: 'order-1',
      })
    );
    expect(applySuccessfulDeliveryTrustScore).toHaveBeenCalledWith(orderDoc);
  });

  it('requires meetup details when moving to Meetup Scheduled', async () => {
    User.findById.mockResolvedValue({ _id: 'buyer-1', role: 'user' });

    const save = jest.fn().mockResolvedValue(undefined);
    const orderDoc = {
      _id: 'order-1',
      buyerId: { toString: () => 'buyer-1' },
      sellerId: { toString: () => 'seller-1' },
      status: ORDER_STATUS.PENDING,
      cancellationReason: null,
      cancelledBy: null,
      save,
    };

    Order.findById.mockResolvedValue(orderDoc);

    const response = await request(app)
      .patch('/api/orders/order-1/status')
      .set('x-user-id', 'buyer-1')
      .send({ nextStatus: ORDER_STATUS.MEETUP_SCHEDULED });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      'meetupType is required and must be either verified or custom when scheduling meetup'
    );
    expect(save).not.toHaveBeenCalled();
  });

  it('stores meetup details when moving to Meetup Scheduled', async () => {
    User.findById.mockResolvedValue({ _id: 'buyer-1', role: 'user' });

    const save = jest.fn().mockResolvedValue(undefined);
    const orderDoc = {
      _id: 'order-1',
      buyerId: { toString: () => 'buyer-1' },
      sellerId: { toString: () => 'seller-1' },
      status: ORDER_STATUS.PENDING,
      cancellationReason: null,
      cancelledBy: null,
      meetupType: null,
      meetupLocation: null,
      meetupScheduledFor: null,
      save,
    };

    Order.findById.mockResolvedValue(orderDoc);

    const response = await request(app)
      .patch('/api/orders/order-1/status')
      .set('x-user-id', 'buyer-1')
      .send({
        nextStatus: ORDER_STATUS.MEETUP_SCHEDULED,
        meetupType: 'verified',
        meetupLocation: 'Library Forecourt',
        meetupScheduledFor: '2026-04-10T14:00:00.000Z',
      });

    expect(response.statusCode).toBe(200);
    expect(save).toHaveBeenCalledTimes(1);
    expect(orderDoc.meetupType).toBe('verified');
    expect(orderDoc.meetupLocation).toBe('Library Forecourt');
    expect(orderDoc.meetupScheduledFor).toBeInstanceOf(Date);
  });

  it('applies actor-based penalty and monitoring on cancellation', async () => {
    User.findById.mockResolvedValue({ _id: 'buyer-1', role: 'user' });

    const save = jest.fn().mockResolvedValue(undefined);
    const orderDoc = {
      _id: 'order-1',
      buyerId: { toString: () => 'buyer-1' },
      sellerId: { toString: () => 'seller-1' },
      status: ORDER_STATUS.PENDING,
      cancellationReason: null,
      cancelledBy: null,
      save,
    };

    Order.findById.mockResolvedValue(orderDoc);
    monitorUserCancellationBehavior.mockResolvedValue({ shouldFlag: false });
    applyCancellationTrustScore.mockResolvedValue({ event: 'cancelled' });

    const response = await request(app)
      .patch('/api/orders/order-1/cancel')
      .set('x-user-id', 'buyer-1')
      .send({ cancellationReason: 'Changed mind' });

    expect(response.statusCode).toBe(200);
    expect(save).toHaveBeenCalledTimes(1);
    expect(orderDoc.cancelledBy).toBe('buyer-1');
    expect(AuditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'order.status_changed',
        actorId: 'buyer-1',
        entityType: 'order',
        entityId: 'order-1',
      })
    );
    expect(monitorUserCancellationBehavior).toHaveBeenCalledWith('buyer-1');
    expect(applyCancellationTrustScore).toHaveBeenCalledWith('buyer-1');
  });

  it('blocks review submission until order is Delivered', async () => {
    User.findById.mockResolvedValue({ _id: 'buyer-1', role: 'user' });

    Order.findById.mockResolvedValue({
      _id: 'order-1',
      buyerId: { toString: () => 'buyer-1' },
      sellerId: { toString: () => 'seller-1' },
      status: ORDER_STATUS.MEETUP_SCHEDULED,
    });

    const response = await request(app)
      .post('/api/orders/order-1/reviews')
      .set('x-user-id', 'buyer-1')
      .send({ rating: 5, comment: 'Great seller' });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Reviews can only be submitted after Delivered status');
  });

  it('enforces one review per order side', async () => {
    User.findById.mockResolvedValue({ _id: 'buyer-1', role: 'user' });

    Order.findById.mockResolvedValue({
      _id: 'order-1',
      buyerId: { toString: () => 'buyer-1' },
      sellerId: { toString: () => 'seller-1' },
      status: ORDER_STATUS.DELIVERED,
      buyerReviewed: true,
      sellerReviewed: false,
    });

    const response = await request(app)
      .post('/api/orders/order-1/reviews')
      .set('x-user-id', 'buyer-1')
      .send({ rating: 5, comment: 'Great seller' });

    expect(response.statusCode).toBe(409);
    expect(response.body.message).toBe('You have already submitted a review for this order');
  });

  it('creates a review and returns trust-score review signal', async () => {
    User.findById.mockResolvedValue({ _id: 'buyer-1', role: 'user' });

    const save = jest.fn().mockResolvedValue(undefined);
    Order.findById.mockResolvedValue({
      _id: 'order-1',
      buyerId: { toString: () => 'buyer-1' },
      sellerId: { toString: () => 'seller-1' },
      status: ORDER_STATUS.DELIVERED,
      buyerReviewed: false,
      sellerReviewed: false,
      save,
    });

    Review.findOne.mockResolvedValue(null);
    Review.create.mockResolvedValue({
      _id: 'review-1',
      orderId: 'order-1',
      reviewerId: 'buyer-1',
      revieweeId: 'seller-1',
      rating: 5,
      comment: 'Great seller',
    });
    applyReviewTrustScore.mockResolvedValue({ event: 'review', delta: 1 });

    const response = await request(app)
      .post('/api/orders/order-1/reviews')
      .set('x-user-id', 'buyer-1')
      .send({ rating: 5, comment: 'Great seller' });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Review submitted successfully');
    expect(save).toHaveBeenCalledTimes(1);
    expect(applyReviewTrustScore).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: 'review-1',
      })
    );
  });

  it('lists seller reviews with aggregate summary', async () => {
    const reviews = [{ _id: 'review-1', rating: 5 }];
    Review.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(reviews),
      }),
    });
    Review.aggregate.mockResolvedValue([{ averageRating: 4.5, ratingCount: 2 }]);

    const response = await request(app).get('/api/orders/seller/507f1f77bcf86cd799439011/reviews');

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: 'review-1',
          rating: 5,
          report: expect.objectContaining({
            isReported: false,
          }),
        }),
      ])
    );
    expect(response.body.summary).toEqual({ averageRating: 4.5, ratingCount: 2 });
  });

  it('reports an abusive review for moderation', async () => {
    User.findById.mockResolvedValue({ _id: 'buyer-1', role: 'user' });

    const save = jest.fn().mockResolvedValue(undefined);
    Review.findById.mockResolvedValue({
      _id: '507f1f77bcf86cd799439021',
      orderId: '507f1f77bcf86cd799439031',
      revieweeId: '507f1f77bcf86cd799439041',
      report: {
        isReported: false,
      },
      save,
    });

    const response = await request(app)
      .post('/api/orders/reviews/507f1f77bcf86cd799439021/report')
      .set('x-user-id', 'buyer-1')
      .send({ reason: 'Contains abusive language' });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Review reported successfully');
    expect(save).toHaveBeenCalledTimes(1);
    expect(AuditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'review.reported',
        actorId: 'buyer-1',
      })
    );
  });
});
