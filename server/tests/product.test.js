const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Product = require('../src/models/product.model');
const { uploadManyImages } = require('../src/services/product.service');

jest.mock('../src/models/user.model');
jest.mock('../src/models/product.model');
jest.mock('../src/services/product.service', () => ({
  uploadManyImages: jest.fn(),
}));

const createProductListQueryMock = (result) => ({
  populate: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockResolvedValue(result),
});

describe('Product routes CRUD', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/products returns paginated products', async () => {
    const products = [{ _id: 'p1', title: 'Product 1' }];

    Product.find.mockReturnValue(createProductListQueryMock(products));
    Product.countDocuments.mockResolvedValue(1);

    const response = await request(app).get('/api/products?page=1&limit=10');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(products);
    expect(response.body.pagination.total).toBe(1);
  });

  it('GET /api/products?q=book applies keyword filter', async () => {
    const products = [{ _id: 'p1', title: 'Biology Book' }];

    Product.find.mockReturnValue(createProductListQueryMock(products));
    Product.countDocuments.mockResolvedValue(1);

    const response = await request(app).get('/api/products?q=book');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Product.find).toHaveBeenCalledWith(
      expect.objectContaining({
        $text: { $search: 'book' },
      })
    );
  });

  it('GET /api/products/:id returns 404 when product does not exist', async () => {
    Product.findById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      }),
    });

    const response = await request(app).get('/api/products/missing-product-id');

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Product not found');
  });

  it('POST /api/products creates a product for authenticated seller', async () => {
    User.findById.mockResolvedValue({ _id: 'seller-1', role: 'user' });

    uploadManyImages.mockResolvedValue([
      { secureUrl: 'https://cdn.example.com/p1.jpg', publicId: 'p1' },
    ]);

    const save = jest.fn().mockResolvedValue(undefined);
    Product.mockImplementation((payload) => ({
      ...payload,
      _id: 'product-1',
      save,
    }));

    const response = await request(app)
      .post('/api/products')
      .set('x-user-id', 'seller-1')
      .field('title', 'Biology Textbook')
      .field('description', 'Like new')
      .field('category', 'Textbooks')
      .field('condition', 'Good')
      .field('price', '120')
      .field('meetingSpot', 'verified')
      .attach('images', Buffer.from('fake-image'), {
        filename: 'book.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Product created successfully');
    expect(uploadManyImages).toHaveBeenCalled();
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('POST /api/products rejects create request without images', async () => {
    User.findById.mockResolvedValue({ _id: 'seller-1', role: 'user' });

    const response = await request(app)
      .post('/api/products')
      .set('x-user-id', 'seller-1')
      .field('title', 'Biology Textbook')
      .field('description', 'Like new')
      .field('category', 'Textbooks')
      .field('condition', 'Good')
      .field('price', '120')
      .field('meetingSpot', 'verified');

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('At least one product image is required');
    expect(uploadManyImages).not.toHaveBeenCalled();
  });

  it('PATCH /api/products/:id blocks updates by non-owner', async () => {
    User.findById.mockResolvedValue({ _id: 'user-2', role: 'user' });

    Product.findById.mockResolvedValue({
      _id: 'product-1',
      sellerId: { toString: () => 'seller-1' },
    });

    const response = await request(app)
      .patch('/api/products/product-1')
      .set('x-user-id', 'user-2')
      .field('title', 'Updated Title');

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('You do not have permission to update this product');
  });

  it('DELETE /api/products/:id deletes product for owner', async () => {
    User.findById.mockResolvedValue({ _id: 'seller-1', role: 'user' });

    Product.findById.mockResolvedValue({
      _id: 'product-1',
      sellerId: { toString: () => 'seller-1' },
    });

    Product.findByIdAndDelete.mockResolvedValue({ _id: 'product-1' });

    const response = await request(app)
      .delete('/api/products/product-1')
      .set('x-user-id', 'seller-1');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Product deleted successfully');
    expect(Product.findByIdAndDelete).toHaveBeenCalledWith('product-1');
  });
});
