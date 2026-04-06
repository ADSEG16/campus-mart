const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  MEETUP_SCHEDULED: 'meetup_scheduled',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
});

const ORDER_ALLOWED_TRANSITIONS = Object.freeze({
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.MEETUP_SCHEDULED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.MEETUP_SCHEDULED]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
});

const ORDER_STATUS_VALUES = Object.freeze(Object.values(ORDER_STATUS));

const STATUS_DESCRIPTIONS = Object.freeze({
  [ORDER_STATUS.PENDING]: 'Order placed, awaiting seller acceptance',
  [ORDER_STATUS.MEETUP_SCHEDULED]: 'Meetup arranged, pending confirmation',
  [ORDER_STATUS.DELIVERED]: 'Both parties confirmed delivery',
  [ORDER_STATUS.CANCELLED]: 'Order cancelled',
});

module.exports = {
  ORDER_STATUS,
  ORDER_ALLOWED_TRANSITIONS,
  ORDER_STATUS_VALUES,
  STATUS_DESCRIPTIONS,
};