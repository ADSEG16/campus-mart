const express = require('express');
const cors = require('cors');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');
const productRoutes = require('./routes/product.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const errorHandler = require('./middleware/error.middleware');
const { sendSuccess } = require('./utils/response');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);


app.get("/api/health", (req, res) => {
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Service is healthy',
    data: { status: 'ok' },
    extras: { status: 'ok' },
  });
});

app.use(errorHandler);

module.exports = app;