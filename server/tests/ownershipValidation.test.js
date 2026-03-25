const validateOwnership = require('../src/middleware/ownershipValidation');
const Product = require('../src/models/product.model');

jest.mock('../src/models/product.model');

describe('validateOwnership Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { _id: 'user123' },
      params: { productId: 'product456' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('✅ Should call next() when JWT user ID matches sellerId', async () => {
    Product.findById.mockResolvedValue({
      _id: 'product456',
      sellerId: 'user123',
    });

    await validateOwnership(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('🚫 Should return 403 when JWT user ID does NOT match sellerId', async () => {
    Product.findById.mockResolvedValue({
      _id: 'product456',
      sellerId: 'differentUser999',
    });

    await validateOwnership(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Forbidden: You do not have permission to modify this product.',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('🔍 Should return 404 when product does not exist', async () => {
    Product.findById.mockResolvedValue(null);

    await validateOwnership(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Product not found.' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('⚠️ Should return 400 when no product ID is provided', async () => {
    req.params = {};

    await validateOwnership(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('💥 Should return 500 on unexpected database error', async () => {
    Product.findById.mockRejectedValue(new Error('DB connection failed'));

    await validateOwnership(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
  });

  test('✅ Should attach product to req on success', async () => {
    const mockProduct = {
      _id: 'product456',
      sellerId: 'user123',
    };
    Product.findById.mockResolvedValue(mockProduct);

    await validateOwnership(req, res, next);

    expect(req.product).toBe(mockProduct);
    expect(next).toHaveBeenCalled();
  });
});