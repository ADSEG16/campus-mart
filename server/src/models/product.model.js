const mongoose = require('mongoose');
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Textbooks', 'Electronics', 'Clothing', 'Furniture', 'Stationery', 'Services', 'Other'],
      required: true,
      trim: true,
    },
    condition: {
      type: String,
      enum: ['New', 'Used'],
      required: true,
    },
    meetingSpot: {
      type: String,
      enum: ['verified', 'custom'],
      default: 'verified',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Unavailable', 'Sold'],
      default: 'Available',
    },
    status: {
      type: String,
      enum: ['active', 'unavailable', 'sold'],
      default: 'active',
      deprecated: true,
    },
    stock: {
      type: Number,
      default: 1,
      min: 0,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

productSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);