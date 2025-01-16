const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { authRouter } = require('./router/authRouter')
const { connectDb } = require('./config/connectDb')
const cookieParser = require('cookie-parser');
const { productRouter } = require('./router/productRouter')
const WebSocket = require('ws');
const { websocket } = require('./websockets/websocket')



require('dotenv').config()

const app = express()

//websocket
const wss = new WebSocket.Server({ noServer: true });

websocket(wss)


const allowedOrigins = [
  'https://shop-fe-tan.vercel.app', // Thêm domain frontend mới vào danh sách cho phép
  'https://shop-6zr4ds5dh-thehien99s-projects.vercel.app', // Miền cũ
  // Nếu có nhiều miền frontend khác, có thể thêm ở đây.
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true); // cho phép yêu cầu từ origin hợp lệ
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Nếu bạn cần gửi cookie hay session
};

app.use(cors(corsOptions));

// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true
// }))




app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


authRouter(app)
productRouter(app)
connectDb()



let port = process.env.port || 6969
app.server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});