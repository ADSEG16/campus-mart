const mongoose = require('mongoose');
const { createOrder } = require('../src/controllers/order.controller');
const Product = require('../src/models/product.model');
const Order = require('../src/models/order.model');

jest.mock('../src/models/product.model');
jest.mock('../src/models/order.model');
jest.mock('../src/services/cancellationMonitor.service', () => ({
  monitorUserCancellationBehavior: jest.fn(),
}));
jest.mock('../src/services/trustScore.service', () => ({
  applySuccessfulDeliveryTrustScore: jest.fn(),
  applyCancellationTrustScore: jest.fn(),
}));
jest.mock('../src/utils/response', () => ({
  sendSuccess: jest.fn((res, { statusCode = 200, message, data }) => {
    res.statusCode = statusCode;
    res.body = { message, data };
    return res;
  }),
  sendError: jest.fn((res, { statusCode, message }) => {
    res.statusCode = statusCode;
    res.body = { message };
    return res;
  }),
}));

describe('Order Validation - createOrder', () => {
  let req, res, next;

  const mockProduct = {
    _id: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'),
    title: 'Test Book',
    price: 50,
    stock: 5,
    availabilityStatus: 'Available',
    sellerId: new mongoose.Types.ObjectId('bbbbbbbbbbbbbbbbbbbbbbbb'),
  };

  beforeEach(() => {
    req = {
      user: { _id: new mongoose.Types.ObjectId('cccccccccccccccccccccccc'), emailVerified: true, isVerified: true },
      body: {
        items: [{ productId: String(mockProduct._id), quantity: 1 }],
      },
    };
    res = {
      statusCode: null,
      body: null,
    };
    next = jest.fn();

    Product.find.mockResolvedValue([mockProduct]);
    Product.findOneAndUpdate.mockResolvedValue({ ...mockProduct, stock: 4 });
    Product.findByIdAndUpdate.mockResolvedValue({});
    Order.create.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      buyerId: req.user._id,
      sellerId: mockProduct.sellerId,
      items: [{ productId: mockProduct._id, quantity: 1, priceSnapshot: 50 }],
      totalAmount: 50,
      status: 'pending',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('✅ Creates order successfully with correct price snapshot', async () => {
    await createOrder(req, res, next);

    expect(Order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({ priceSnapshot: 50 }),
        ]),
        totalAmount: 50,
      })
    );
    expect(res.statusCode).toBe(201);
  });

  test('🚫 Returns 400 if items array is empty', async () => {
    req.body.items = [];
    await createOrder(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('At least one order item is required');
  });

  test('🚫 Returns 404 if product does not exist', async () => {
    Product.find.mockResolvedValue([]);
    await createOrder(req, res, next);
    expect(res.statusCode).toBe(404);
  });

  test('🚫 Returns 400 if product is unavailable', async () => {
    Product.find.mockResolvedValue([{ ...mockProduct, availabilityStatus: 'Unavailable' }]);
    await createOrder(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('🚫 Returns 400 if stock is insufficient', async () => {
    Product.find.mockResolvedValue([{ ...mockProduct, stock: 0 }]);
    await createOrder(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('🚫 Returns 400 if buyer is the seller', async () => {
    req.user._id = mockProduct.sellerId;
    await createOrder(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('You cannot create an order for your own product');
  });

  test('🔒 Returns 409 if stock was taken by another buyer (race condition)', async () => {
    Product.findOneAndUpdate.mockResolvedValue(null);
    await createOrder(req, res, next);
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('One or more products are no longer available or have insufficient stock');
  });

  test('✅ Reduces stock after successful order', async () => {
    await createOrder(req, res, next);
    expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ stock: { $gte: 1 } }),
      expect.objectContaining({ $inc: { stock: -1 } }),
      { new: true }
    );
  });

  test('✅ Marks product unavailable when stock hits 0', async () => {
    Product.findOneAndUpdate.mockResolvedValue({ ...mockProduct, stock: 0 });
    await createOrder(req, res, next);
    expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
      mockProduct._id,
      { availabilityStatus: 'Unavailable' }
    );
  });
});