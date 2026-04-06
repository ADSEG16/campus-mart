const mongoose = require('mongoose');
const { getRecommendations } = require('../src/controllers/recommendation.controller');
const Product = require('../src/models/product.model');
const User = require('../src/models/user.model');

jest.mock('../src/models/product.model');
jest.mock('../src/models/user.model');
jest.mock('../src/utils/response', () => ({
  sendSuccess: jest.fn((res, { statusCode = 200, message, data, extras }) => {
    res.statusCode = statusCode;
    res.body = { message, data, extras };
    return res;
  }),
  sendError: jest.fn((res, { statusCode, message }) => {
    res.statusCode = statusCode;
    res.body = { message };
    return res;
  }),
}));

const mockPopulate = (returnValue) => ({
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockResolvedValue(returnValue),
});

describe('Recommendation Controller', () => {
  let req, res, next;

  const sellerA = {
    _id: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'),
    fullName: 'Seller A',
    trustScore: 80,
  };

  const mockProducts = [
    {
      _id: new mongoose.Types.ObjectId('bbbbbbbbbbbbbbbbbbbbbbbb'),
      title: 'Biology Textbook',
      category: 'Books',
      views: 100,
      availabilityStatus: 'Available',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      sellerId: sellerA,
    },
    {
      _id: new mongoose.Types.ObjectId('cccccccccccccccccccccccc'),
      title: 'Calculator',
      category: 'Electronics',
      views: 50,
      availabilityStatus: 'Available',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      sellerId: sellerA,
    },
  ];

  beforeEach(() => {
    req = { query: {}, user: { _id: new mongoose.Types.ObjectId() } };
    res = { statusCode: null, body: null };
    next = jest.fn();

    User.find.mockResolvedValue([sellerA]);

    Product.findById.mockResolvedValue(mockProducts[0]);

    Product.find.mockImplementation(() => mockPopulate(mockProducts));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('✅ Returns recommendations successfully', async () => {
    await getRecommendations(req, res, next);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Recommendations fetched successfully');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('✅ Uses category from recently viewed product when productId is provided', async () => {
    req.query.productId = String(mockProducts[0]._id);
    await getRecommendations(req, res, next);
    expect(Product.findById).toHaveBeenCalledWith(String(mockProducts[0]._id));
    expect(res.body.extras.basedOn.category).toBe('Books');
  });

  test('✅ Returns null category when no productId provided', async () => {
    await getRecommendations(req, res, next);
    expect(res.body.extras.basedOn.category).toBeNull();
  });

  test('✅ Includes trusted seller count in response extras', async () => {
    await getRecommendations(req, res, next);
    expect(res.body.extras.basedOn.trustedSellers).toBe(1);
  });

  test('✅ Deduplicates products across all 3 signals', async () => {
    await getRecommendations(req, res, next);
    const ids = res.body.data.map((p) => String(p._id));
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });

  test('✅ Returns empty recommendations when no trusted sellers exist', async () => {
    User.find.mockResolvedValue([]);
    Product.find.mockImplementation(() => mockPopulate([]));
    await getRecommendations(req, res, next);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test('💥 Calls next on unexpected error', async () => {
    Product.find.mockImplementation(() => {
      throw new Error('DB error');
    });
    await getRecommendations(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});