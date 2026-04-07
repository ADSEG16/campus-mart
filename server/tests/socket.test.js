const { io } = require("socket.io-client");

const runIntegration = process.env.RUN_SOCKET_INTEGRATION === "true";

test("socket integration is opt-in", () => {
  expect(runIntegration).toBe(false);
});

const maybeDescribe = runIntegration ? describe : describe.skip;

maybeDescribe("Socket messaging integration", () => {
  const serverUrl = process.env.SOCKET_TEST_URL || "http://localhost:5000";
  const senderToken = process.env.SOCKET_TEST_TOKEN;
  const conversationId = process.env.SOCKET_TEST_CONVERSATION_ID;

  test("joins conversation and sends message", (done) => {
    if (!senderToken || !conversationId) {
      done(new Error("Missing SOCKET_TEST_TOKEN or SOCKET_TEST_CONVERSATION_ID"));
      return;
    }

    const socket = io(serverUrl, {
      auth: { token: senderToken },
      transports: ["websocket"],
    });

    const finish = (error) => {
      socket.disconnect();
      if (error) {
        done(error);
        return;
      }
      done();
    };

    socket.on("connect_error", (err) => {
      finish(err);
    });

    socket.on("connect", () => {
      socket.emit("conversation:join", { conversationId }, (joinRes) => {
        if (!joinRes?.ok) {
          finish(new Error("Join conversation failed"));
          return;
        }

        socket.emit("message:send", { conversationId, text: "Hello from integration test" }, (sendRes) => {
          if (!sendRes?.ok) {
            finish(new Error("Send message failed"));
            return;
          }

          finish();
        });
      });
    });
  }, 15000);
});
