const mongoose = require('mongoose');

const AUDIT_EVENT_TYPES = Object.freeze([
  'order.status_changed',
  'order.delivery_confirmation_recorded',
  'moderation.verification_approved',
  'moderation.verification_rejected',
]);

const auditEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: AUDIT_EVENT_TYPES,
      required: true,
      immutable: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    entityType: {
      type: String,
      enum: ['order', 'user'],
      required: true,
      immutable: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      immutable: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      immutable: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const blockMutation = function blockMutation(next) {
  return next(new Error('Audit entries are immutable and append-only'));
};

auditEventSchema.pre('updateOne', blockMutation);
auditEventSchema.pre('findOneAndUpdate', blockMutation);
auditEventSchema.pre('replaceOne', blockMutation);
auditEventSchema.pre('findOneAndReplace', blockMutation);
auditEventSchema.pre('deleteOne', blockMutation);
auditEventSchema.pre('findOneAndDelete', blockMutation);
auditEventSchema.pre('deleteMany', blockMutation);

module.exports = mongoose.model('AuditEvent', auditEventSchema);
