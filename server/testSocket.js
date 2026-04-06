const { io } = require("socket.io-client");

const socket = io("http://localhost:5000", {
  auth: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDBmNDlkNzFmN2JjZTZlZmQwMzJjOCIsImlhdCI6MTc3NTMwNDI2MiwiZXhwIjoxNzc1OTA5MDYyfQ.26D8_hocGnfXf0g9vDsO6Y8tTq9N5w4-MaDqKV6wJYc",
  },
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit(
    "conversation:join",
    { conversationId: "69d10ca489864b5aa51cef1a" },
    (res) => {
      console.log("Join response:", res);
    },
  );
});

socket.on("connect_error", (err) => {
  console.log("Connection error:", err.message);
});
