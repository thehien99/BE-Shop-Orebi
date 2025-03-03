const redis = require('../redis/redis')
let io;
let connectedAdmins = new Set();  // Set lưu trữ socket ID của các admin đang kết nối

function initializeSocketServer(server) {
  io = require('socket.io')(server, {
    cors: {
      origin: 'https://shop-fe-seven.vercel.app/',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('Admin đã kết nối:', socket.id);
    connectedAdmins.add(socket.id);

    //lấy thông báo khi admin kết nối lại
    redis.getAllOrdersFromCache()
      .then((orders) => {
        orders.forEach(order => {
          socket.emit('newOrder', order);  // Gửi thông báo cho admin về các đơn hàng cũ
        });
      })
      .catch((error) => {
        console.error('Lỗi khi lấy đơn hàng từ Redis:', error);
      });


    // Lắng nghe sự kiện admin rời đi
    socket.on('disconnect', () => {
      console.log('Admin đã ngắt kết nối:', socket.id);
      connectedAdmins.delete(socket.id);
    });
  });
}

function emitNewOrder(order) {
  if (connectedAdmins.size > 0) {
    // Nếu có admin kết nối, gửi thông báo đến tất cả admin
    io.emit('newOrder', order);
  } else {
    // Nếu không có admin nào kết nối, lưu vào Redis
    redis.cacheNewOrder(order)
  }
}

module.exports = { initializeSocketServer, emitNewOrder };
