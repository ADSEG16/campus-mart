const { io } = require("socket.io-client");

const senderToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDQ0NmYwM2ZjNTRkOWE4N2RmNzgzMyIsImlhdCI6MTc3NTUxOTg4MiwiZXhwIjoxNzc1NjA2MjgyfQ.w6uneA2udHFuBVpUfk_Itq_cEwHrJsg1nmyC3TpRfsE";
const conversationId = "69d44faaa104f9e8d9bc5bbd"; // Your existing conversation

const socket = io("http://localhost:5000", {
  auth: { token: senderToken },
});

socket.on("connect", () => {
  console.log("Sender Connected:", socket.id);

  // Join conversation
  socket.emit("conversation:join", { conversationId }, (res) => {
    console.log("Join response:", res);

    if (res.ok) {
      // Send a test message
      socket.emit(
        "message:send",
        { conversationId, text: "Hello from sender!" },
        (sendRes) => {
          console.log("Send response:", sendRes);
        },
      );
    }
  });
});

// Listen for message status updates
socket.on("message:status", (data) => {
  console.log("Message status update:", data);
});

socket.on("message:new", (msg) => {
  console.log("New message received:", msg);
});
