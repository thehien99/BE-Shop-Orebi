const authServices = require('../services/authServices')
const jwt = require('jsonwebtoken')
const { generateAccessToken } = require('../services/token')

const register = async (req, res, next) => {
  const { name, emailOrPhone, password } = req.body
  try {
    if (!name || !emailOrPhone || !password)
      return res.status(400).json({
        err: 0,
        msg: 'Create Failed'
      })

    const response = await authServices.registerService(req.body)
    res.cookie('jwt', response.refreshToken, { httpOnly: true, secure: true })
    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
  }
}




const loginController = async (req, res) => {
  const { emailOrPhone, password } = req.body
  try {
    if (!emailOrPhone || !password)
      return res.status(400).json({
        err: 0,
        msg: 'Login Failed'
      })
    const response = await authServices.loginServices(req.body)
    console.log(response)
    res.cookie('refreshToken', response.refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 7 * 24 * 60 * 60 * 1000 })
    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
  }
}

const getUserController = async (req, res) => {
  const id = req.user
  console.log('id', id)
  try {
    if (!id) {
      return res.status(401).json({
        msg: 'Token expired'
      })
    }
    const response = await authServices.getUserServices(id)
    return res.status(200).json(response)

  } catch (error) {
    console.log(error)
  }
}

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken
  console.log('rftk', refreshToken)
  if (!refreshToken) {
    return res.status(403).json({
      msg: 'Error'
    })
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.json(err)
    }
    const accessToken = generateAccessToken(user.id)
    console.log(accessToken)
    res.json({ accessToken })
  })

}

module.exports = {
  register,
  loginController,
  getUserController,
  refreshToken
}