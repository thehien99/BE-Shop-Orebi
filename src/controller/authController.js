const authServices = require('../services/authServices')
const jwt = require('jsonwebtoken')
const { generateAccessToken } = require('../services/token')
const db = require('../models')
const { v4 } = require('uuid')

const register = async (req, res, next) => {
  const { name, emailOrPhone, password, role } = req.body
  try {
    if (!name || !emailOrPhone || !password || !role)
      return res.status(400).json({
        err: 0,
        msg: 'Create Failed'
      })

    const response = await authServices.registerService(req.body)
    res.cookie('refreshToken', response.refreshToken, { httpOnly: true, secure: true })
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
    res.cookie('refreshToken', response.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Chỉ bật Secure khi chạy production
      sameSite: 'Lax', // Hoặc 'None' nếu cần dùng cross-site
      maxAge: 7 * 24 * 60 * 60 * 1000, // Thời hạn cookie (7 ngày)
    });
    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
  }
}

const createAddress = async (req, res) => {
  const { address, userId, phone } = req.body
  if (!address) {
    return res.status(500).json({
      msg: 'Error'
    })
  }
  try {
    const response = await db.Address.findOrCreate({
      where: { userId },
      defaults: {
        id: v4(),
        userId,
        address,
        phone
      }
    })
    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
  }
}

const getAdress = async (req, res) => {
  const id = req.user
  if (!id) {
    return res.status(401).json({
      msg: 'error'
    })
  }
  try {
    const response = await db.Address.findOne({
      where: { userId: id },
      raw: true
    })
    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
  }
}

const updateUser = async (req, res) => {
  const id = req.user
  console.log(id)
  const { name, address, phone } = req.body
  if (!id) {
    return res.status(500).json({
      msg: 'Error'
    })
  }
  try {
    await db.User.update({
      name: name,
    }, { where: { id } })
    await db.Address.update({
      phone,
      address
    }, { where: { userId: id } })

    return res.status(200).json({
      msg: 'Update success'
    })
  } catch (error) {
    console.log(error)
  }
}

const getUserController = async (req, res) => {
  const id = req.user
  console.log('id', id)
  if (!id) {
    return res.status(401).json({
      msg: 'Token expired'
    })
  }
  try {
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
    return res.status(401).json({
      message: 'Refreshtoken missing'
    })
  }
  if (!refreshToken.includes(refreshToken)) {
    return res.status(403).json({
      message: 'Invalid refreshToken'
    })
  }
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: 'Invalid token'
      })
    }
    const accessToken = generateAccessToken(user.id)
    res.json({ accessToken })
  })
}

const logoutController = (req, res) => {
  res.cookie('jwt', "", {
    httpOnly: true,
    expires: new Date(0)
  })
  res.cookie('refreshToken', "", {
    httpOnly: true,
    expires: new Date(0)
  })

  res.status(200).json("Logout success")
}

//admin
const loginAdmin = async (req, res) => {
  const { emailOrPhone, password } = req.body
  if (!emailOrPhone || !password) {
    return res.status(500).json({
      msg: 'Error'
    })
  }
  try {
    const response = await authServices.loginAdmin(req.body)
    res.cookie('refreshToken', response.refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict' })
    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
  }
}


const getAllUserAdmin = async (req, res) => {
  const id = req.user
  if (!id) {
    return res.status(401).json({
      msg: 'token error'
    })
  }
  try {
    const userId = await db.User.findAll({
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt']
      }
    })

    const findAddress = await Promise.all(
      userId.map(async (item) => {
        const response = await db.Address.findOne({
          where: { userId: item?.id },
          attributes: {
            exclude: ['id', 'userId', 'createdAt', 'updatedAt']
          }
        })

        return { ...item.dataValues, address: response }
      })
    )
    return res.status(200).json(findAddress)
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  register,
  loginController,
  getUserController,
  refreshToken,
  logoutController,
  loginAdmin,
  updateUser,
  createAddress,
  getAdress,
  getAllUserAdmin
}