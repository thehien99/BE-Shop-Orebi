const jwt = require('jsonwebtoken')
require('dotenv').config()

const verifyToken = (req, res, next) => {
  const accessToken = req.headers.authorization?.split(" ")[1]
  if (!accessToken)
    return res.status(401).json({
      err: 1,
      msg: "Missing access token"
    })


  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log(err)
    }
    req.user = user?.id
    next()
  })
}

module.exports = { verifyToken }