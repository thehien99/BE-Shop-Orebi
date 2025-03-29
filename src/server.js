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



app.use(cors({
  origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức hợp lệ,
  allowedHeaders: ['Content-Type', 'Authorization'], // Các header hợp lệ
}))



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


