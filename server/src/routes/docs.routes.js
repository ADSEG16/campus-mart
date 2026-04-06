const express = require('express');

const router = express.Router();

// OpenAPI 3.0 Specification for CampusMart API
const openAPISpec = {
  openapi: '3.0.0',
  info: {
    title: 'CampusMart API',
    description: 'Campus Marketplace Platform - Verified Student-to-Student Trading',
    version: '1.0.0',
    contact: {
      name: 'CampusMart Support',
      email: 'support@campusmart.ug',
    },
  },
  servers: [
    {
      url: process.env.API_BASE_URL || 'http://localhost:5000/api',
      description: 'Production Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        required: ['email', 'fullName', 'password'],
        properties: {
          _id: { type: 'string', format: 'uuid' },
          fullName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          department: { type: 'string' },
          graduationYear: { type: 'number' },
          role: { type: 'string', enum: ['user', 'admin'], default: 'user' },
          trustScore: { type: 'number', minimum: 0, maximum: 100, default: 50 },
          isVerified: { type: 'boolean', default: false },
          flagged: { type: 'boolean', default: false },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Product: {
        type: 'object',
        required: ['title', 'description', 'price', 'category', 'condition'],
        properties: {
          _id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          category: {
            type: 'string',
            enum: ['Textbooks', 'Electronics', 'Clothing', 'Furniture', 'Stationery', 'Services', 'Other'],
          },
          condition: { type: 'string', enum: ['New', 'Used'] },
          price: { type: 'number', minimum: 0 },
          sellerId: { type: 'string', format: 'uuid' },
          images: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                url: { type: 'string', format: 'uri' },
                publicId: { type: 'string' },
              },
            },
          },
          availabilityStatus: {
            type: 'string',
            enum: ['Available', 'Unavailable', 'Sold'],
            default: 'Available',
          },
          stock: { type: 'number', minimum: 0, default: 1 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Order: {
        type: 'object',
        required: ['items', 'buyerId', 'sellerId'],
        properties: {
          _id: { type: 'string', format: 'uuid' },
          buyerId: { type: 'string', format: 'uuid' },
          sellerId: { type: 'string', format: 'uuid' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string', format: 'uuid' },
                quantity: { type: 'number', minimum: 1 },
                priceSnapshot: { type: 'number' },
              },
            },
          },
          totalAmount: { type: 'number', minimum: 0 },
          status: {
            type: 'string',
            enum: ['pending', 'meetup_scheduled', 'delivered', 'cancelled'],
            default: 'pending',
          },
          meetupType: { type: 'string', enum: ['verified', 'custom'] },
          meetupLocation: { type: 'string' },
          meetupScheduledFor: { type: 'string', format: 'date-time' },
          buyerConfirmed: { type: 'boolean', default: false },
          sellerConfirmed: { type: 'boolean', default: false },
          cancellationReason: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Review: {
        type: 'object',
        required: ['rating', 'revieweeId'],
        properties: {
          _id: { type: 'string', format: 'uuid' },
          orderId: { type: 'string', format: 'uuid' },
          reviewerId: { type: 'string', format: 'uuid' },
          revieweeId: { type: 'string', format: 'uuid' },
          reviewerRole: { type: 'string', enum: ['buyer', 'seller'] },
          rating: { type: 'number', minimum: 1, maximum: 5 },
          comment: { type: 'string', maxLength: 600 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          statusCode: { type: 'number' },
          message: { type: 'string' },
          extras: { type: 'object' },
        },
      },
    },
  },
  paths: {
    '/auth/signup': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user (FR-001)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string' },
                  email: { type: 'string', format: 'email', pattern: '^[^@]+@st\\.ug\\.edu\\.gh$' },
                  password: { type: 'string', minLength: 6 },
                  department: { type: 'string' },
                  graduationYear: { type: 'number' },
                },
                required: ['fullName', 'email', 'password', 'department', 'graduationYear'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully. Verification email sent (FR-002)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    statusCode: { type: 'number', example: 201 },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          400: { description: 'Bad request' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user (FR-004, FR-005)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful. JWT token issued (FR-005, FR-006)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    statusCode: { type: 'number', example: 200 },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/User' },
                    token: { type: 'string', description: 'JWT token valid for 24 hours' },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/verify-email': {
      get: {
        tags: ['Authentication'],
        summary: 'Verify email address (FR-002)',
        parameters: [
          {
            name: 'token',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Email verified successfully' },
          400: { description: 'Invalid or expired token' },
        },
      },
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'Browse and search listings (FR-019, FR-020, FR-021)',
        parameters: [
          {
            name: 'q',
            in: 'query',
            schema: { type: 'string' },
            description: 'Keyword search (FR-020)',
          },
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by category (FR-021)',
          },
          {
            name: 'condition',
            in: 'query',
            schema: { type: 'string', enum: ['New', 'Used'] },
            description: 'Filter by condition (FR-021)',
          },
          {
            name: 'minPrice',
            in: 'query',
            schema: { type: 'number' },
            description: 'Minimum price (FR-021)',
          },
          {
            name: 'maxPrice',
            in: 'query',
            schema: { type: 'number' },
            description: 'Maximum price (FR-021)',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'number', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'number', default: 10, maximum: 100 },
          },
        ],
        responses: {
          200: {
            description: 'Products listed successfully (FR-024)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Product' },
                    },
                    pagination: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create a product listing (FR-010)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  category: {
                    type: 'string',
                    enum: ['Textbooks', 'Electronics', 'Clothing', 'Furniture', 'Stationery', 'Services', 'Other'],
                  },
                  condition: { type: 'string', enum: ['New', 'Used'] },
                  price: { type: 'number', minimum: 0 },
                  images: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                  },
                },
                required: ['title', 'description', 'category', 'condition', 'price', 'images'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Product created successfully (FR-013)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Place a COD order (FR-025)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        productId: { type: 'string', format: 'uuid' },
                        quantity: { type: 'number', minimum: 1 },
                      },
                      required: ['productId', 'quantity'],
                    },
                  },
                },
                required: ['items'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Order created successfully (FR-025, FR-026)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Order' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Orders'],
        summary: 'Get user order history (FR-037)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'role',
            in: 'query',
            schema: { type: 'string', enum: ['buyer', 'seller'] },
          },
        ],
        responses: {
          200: {
            description: 'Orders retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Order' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/orders/{orderId}/status': {
      patch: {
        tags: ['Orders'],
        summary: 'Update order status (FR-030, FR-033)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'orderId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nextStatus: {
                    type: 'string',
                    enum: ['pending', 'meetup_scheduled', 'delivered', 'cancelled'],
                  },
                  meetupType: { type: 'string', enum: ['verified', 'custom'] },
                  meetupLocation: { type: 'string' },
                  meetupScheduledFor: { type: 'string', format: 'date-time' },
                  cancellationReason: { type: 'string' },
                },
                required: ['nextStatus'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Order status updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Order' },
              },
            },
          },
        },
      },
    },
    '/orders/{orderId}/confirm-delivery': {
      patch: {
        tags: ['Orders'],
        summary: 'Confirm order delivery (FR-031, FR-032)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'orderId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Delivery confirmed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Order' },
              },
            },
          },
        },
      },
    },
    '/orders/{orderId}/reviews': {
      post: {
        tags: ['Reviews'],
        summary: 'Submit order review (FR-042)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'orderId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  rating: { type: 'number', minimum: 1, maximum: 5 },
                  comment: { type: 'string', maxLength: 600 },
                },
                required: ['rating'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Review submitted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Review' },
              },
            },
          },
        },
      },
    },
    '/orders/reviews/{reviewId}/report': {
      post: {
        tags: ['Reviews'],
        summary: 'Report a review as abusive (FR-044)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'reviewId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reason: { type: 'string', maxLength: 500 },
                },
                required: ['reason'],
              },
            },
          },
        },
        responses: {
          201: { description: 'Review reported successfully' },
        },
      },
    },
    '/admin/notifications': {
      get: {
        tags: ['Admin'],
        summary: 'Get dashboard alert notifications (FR-049)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Admin alerts retrieved' },
        },
      },
    },
    '/admin/review-reports': {
      get: {
        tags: ['Admin'],
        summary: 'List abusive review reports for moderation (FR-044, FR-049)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['pending', 'dismissed', 'actioned', 'all'] },
          },
        ],
        responses: {
          200: { description: 'Review reports retrieved' },
        },
      },
    },
    '/admin/review-reports/{reviewId}': {
      patch: {
        tags: ['Admin'],
        summary: 'Resolve abusive review report (FR-044, FR-049)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'reviewId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  action: { type: 'string', enum: ['dismissed', 'actioned'] },
                  adminNote: { type: 'string', maxLength: 500 },
                },
                required: ['action'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Review report resolved' },
        },
      },
    },
    '/admin/flagged-users': {
      get: {
        tags: ['Admin'],
        summary: 'Get flagged users (FR-046, FR-048)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Flagged users retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/admin/users/{userId}/verify': {
      patch: {
        tags: ['Admin'],
        summary: 'Approve user verification (FR-046)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: { description: 'User verified' },
        },
      },
    },
    '/admin/users/{userId}/complaint': {
      patch: {
        tags: ['Admin'],
        summary: 'Apply admin complaint penalty (FR-041)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reason: { type: 'string' },
                },
                required: ['reason'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Penalty applied' },
        },
      },
    },
    '/admin/users/{userId}/suspend': {
      patch: {
        tags: ['Admin'],
        summary: 'Suspend user account (FR-050)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: { description: 'Account suspended' },
        },
      },
    },
    '/admin/listings/{listingId}': {
      delete: {
        tags: ['Admin'],
        summary: 'Remove listing (FR-047)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'listingId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: { description: 'Listing removed' },
        },
      },
    },
    '/admin/analytics/orders-by-status': {
      get: {
        tags: ['Admin'],
        summary: 'Get order analytics (FR-051)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Analytics retrieved' },
        },
      },
    },
    '/admin/analytics/orders-by-status/export.csv': {
      get: {
        tags: ['Admin'],
        summary: 'Export order status report CSV (FR-052)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'CSV exported' },
        },
      },
    },
    '/admin/analytics/flagged-users/export.csv': {
      get: {
        tags: ['Admin'],
        summary: 'Export flagged users CSV (FR-052)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'CSV exported' },
        },
      },
    },
    '/admin/analytics/review-reports/export.csv': {
      get: {
        tags: ['Admin'],
        summary: 'Export abusive review reports CSV (FR-044, FR-052)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'CSV exported' },
        },
      },
    },
    '/admin/analytics/moderation-activity/export.csv': {
      get: {
        tags: ['Admin'],
        summary: 'Export moderation activity CSV (FR-052)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'CSV exported' },
        },
      },
    },
  },
};

router.get('/', (req, res) => {
  res.json(openAPISpec);
});

module.exports = router;
