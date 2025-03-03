const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { authRouter } = require('./router/authRouter')
const { connectDb } = require('./config/connectDb')
const cookieParser = require('cookie-parser');
const { productRouter } = require('./router/productRouter')
const http = require('http');
const { initializeSocketServer } = require('./sockets/socket')


require('dotenv').config()

const app = express()

const server = http.createServer(app); // Sử dụng http.createServer thay vì app.listen
initializeSocketServer(server)



const allowedOrigins = [
  'https://shop-fe-seven.vercel.app', // Thêm domain frontend mới vào danh sách cho phép
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
//   origin: 'https://shop-fe-seven.vercel.app', // Thêm domain frontend mới vào danh sách cho phép
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
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


