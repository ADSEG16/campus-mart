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
      required: true,
      trim: true,
    },

    condition: {
      // the used or new condition of the product
      type: String,
      enum: ['New', 'Like New', 'Good', 'Fair'],
      required: true,
    },

    meetingSpot: {
      type: String,
      enum: ['verified', 'custom'],
      required: true,
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

    stock: {
      type: Number,
      default: 1,
      min: 0,
    },

    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
