const WebSocket = require("ws");

let notifications = [];
const admins = new Set(); // Set các WebSocket của admin
const connectedUsers = new Map(); // userId => WebSocket

const websocket = (wss) => {
  wss.on("connection", (ws) => {
    console.log("New client connected");

    ws.on("message", (data) => {
      const message = JSON.parse(data);

      // Xử lý đăng ký vai trò
      if (message.type === "register") {
        const { role, userId } = message;

        if (role === "admin") {
          admins.add(ws); //admin join chat
          console.log("Admin registered");
        } else if (role === "user") {
          connectedUsers.set(userId, ws); // Lưu userId với WebSocket
          console.log(`User ${userId} registered`);
        }
      }

      // Xử lý chat
      if (message.type === "chat") {
        const { role, userId, targetId, content } = message;

        if (role === "user") {
          // Gửi tin nhắn từ user đến tất cả admin
          admins.forEach((adminWs) => {
            if (adminWs.readyState === WebSocket.OPEN) {
              console.log(`Sending message to admin: ${userId}`);
              adminWs.send(
                JSON.stringify({ from: userId, role: "user", content })
              );
            }
          });
        } else if (role === "admin") {
          // Gửi tin nhắn từ admin đến user cụ thể
          const userWs = connectedUsers.get(targetId);
          if (userWs && userWs.readyState === WebSocket.OPEN) {
            userWs.send(
              JSON.stringify({ from: "admin", role: "admin", content })
            );
          }
        }
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");

      // Loại bỏ client khỏi danh sách khi đóng kết nối
      for (const [userId, userWs] of connectedUsers.entries()) {
        if (userWs === ws) {
          connectedUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
        }
      }

      admins.delete(ws);
    });
  });

  // Gửi thông báo cũ cho admin khi reconnect
  wss.on("connection", (ws) => {
    notifications.forEach((message) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  });
};

// Hàm gửi thông báo tới tất cả admin đang kết nối
function broadcastMessage(message) {
  notifications.push(message); // Lưu thông báo vào bộ nhớ tạm thời
  for (const client of admins) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}

module.exports = {
  websocket,
  broadcastMessage,
};
