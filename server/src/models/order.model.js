const mongoose = require('mongoose');
const { ORDER_STATUS, ORDER_STATUS_VALUES } = require('../constants/orderStatus');

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
      enum: ORDER_STATUS_VALUES,
      default: ORDER_STATUS.PENDING,
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