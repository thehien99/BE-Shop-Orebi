const jwt = require('jsonwebtoken')
require('dotenv').config()

const generateAccessToken = (id) => {
  return jwt.sign({ id: id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
}

const generateRefeshToken = (id) => {
  return jwt.sign({ id: id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}
module.exports = {
  generateAccessToken,
  generateRefeshToken
}