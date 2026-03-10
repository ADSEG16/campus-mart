const express = require('express');
const cors = require('cors');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(errorHandler);

module.exports = app;