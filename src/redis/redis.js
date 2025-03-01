const redis = require('redis');

const client = redis.createClient({
    socket: {
        host: 'redis-15237.c85.us-east-1-2.ec2.redns.redis-cloud.com', // Host của Redis Cloud
        port: 15237,
    },
    password: 'HuGQW4YIi9oHuifpOOzsyeyM42bt3aGF', // Mật khẩu Redis
    tls: true, // Kết nối qua TLS nếu yêu cầu
});

client.connect().catch(console.error);

// Lưu đơn hàng vào Redis
const cacheNewOrder = async (order) => {
    try {
        await client.rPush('newOrdersQueue', JSON.stringify(order)); // Thêm đơn hàng vào Redis
    } catch (error) {
        console.error('Lỗi khi lưu vào Redis:', error);
    }
};

// Lấy tất cả đơn hàng từ Redis
const getAllOrdersFromCache = async () => {
    try {
        const orders = await client.lRange('newOrdersQueue', 0, -1); // Lấy tất cả các đơn hàng từ Redis
        return orders.map(order => JSON.parse(order));
    } catch (error) {
        console.error('Lỗi khi lấy đơn hàng từ Redis:', error);
        return [];
    }
};

module.exports = { cacheNewOrder, getAllOrdersFromCache };
