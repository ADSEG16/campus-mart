const express = require("express");
const cors = require("cors");
const orderRoutes = require("./routes/order.routes");
const adminRoutes = require("./routes/admin.routes");
const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const recommendationRoutes = require("./routes/recommendation.routes");
const conversationRoutes = require("./routes/conversation.routes");
const docsRoutes = require("./routes/docs.routes");
const errorHandler = require("./middleware/error.middleware");
const { sendSuccess } = require("./utils/response");
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/docs", docsRoutes);
app.get("/api/health", (req, res) => {
  return sendSuccess(res, {
    statusCode: 200,
    message: "Service is healthy",
    data: { status: "ok" },
    extras: { status: "ok" },
  });
});
app.use(errorHandler);
module.exports = app;
