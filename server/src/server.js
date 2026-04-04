require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");

const { Server } = require("socket.io");
const setupSocket = require("./config/socket"); // make sure path is correct

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

setupSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
