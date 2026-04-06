const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewerRole: {
      type: String,
      enum: ['buyer', 'seller'],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
      trim: true,
      maxlength: 600,
    },
    report: {
      isReported: {
        type: Boolean,
        default: false,
      },
      reason: {
        type: String,
        default: '',
        trim: true,
        maxlength: 500,
      },
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      reportedAt: {
        type: Date,
        default: null,
      },
      status: {
        type: String,
        enum: ['pending', 'dismissed', 'actioned'],
        default: 'pending',
      },
      adminNote: {
        type: String,
        default: '',
        trim: true,
        maxlength: 500,
      },
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      resolvedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ orderId: 1, reviewerId: 1 }, { unique: true });
reviewSchema.index({ revieweeId: 1, createdAt: -1 });
reviewSchema.index({ 'report.isReported': 1, 'report.status': 1, updatedAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
