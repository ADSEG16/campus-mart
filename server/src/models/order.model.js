const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    priceSnapshot: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: v => v.length > 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

		status: {
			type: String,
			enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
			default: 'pending',
		},
		cancellationReason: {
			type: String,
			default: null,
			trim: true,
		},
    buyerConfirmed: {
			type: Boolean,
			default: false,
		},
    sellerConfirmed: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Order', orderSchema);