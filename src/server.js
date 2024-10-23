const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { authRouter } = require('./router/authRouter')
const { connectDb } = require('./config/connectDb')
const cookieParser = require('cookie-parser');
require('dotenv').config()

const app = express()

app.use(cors({
  origin: 'http://localhost:5173', // Địa chỉ frontend của bạn
  credentials: true, // Cho phép gửi cookie và Authorization headers
})); app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

authRouter(app)
connectDb()

let port = process.env.port || 6969
app.listen(port, () => {
  console.log('LocalHost' + port)
})