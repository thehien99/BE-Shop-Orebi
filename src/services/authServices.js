const bcrypt = require("bcryptjs/dist/bcrypt");
const db = require("../models");
const { v4 } = require("uuid");
const { generateAccessToken, generateRefeshToken } = require("./token");

const registerService = ({ name, emailOrPhone, password, role }) => {
  return new Promise(async (resolve, reject) => {
    const hashPassword = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(12));

    try {
      const [user, response] = await db.User.findOrCreate({
        where: { emailOrPhone },
        defaults: {
          id: v4(),
          name,
          emailOrPhone,
          password: hashPassword(password),
          role
        }
      })

      const accessToken = response && generateAccessToken(user.dataValues.id)
      const refreshToken = accessToken && generateRefeshToken(user.dataValues.id)
      if (response) {
        return resolve({
          status: 200,
          msg: 'Create success',
          user,
          accessToken,
          refreshToken
        })
      } else {
        return resolve({
          status: 403,
          msg: 'Email exist',
        })
      }
    } catch (error) {
      reject(error)
    }
  })
}

const loginServices = ({ emailOrPhone, password }) => {
  let token = []
  return new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.findOne({
        where: { emailOrPhone },
        raw: true
      });
      console.log(response)
      const convertPassword = response && bcrypt.compareSync(password, response.password);
      const accessToken = convertPassword && generateAccessToken(response?.id)
      const refreshToken = accessToken && generateRefeshToken(response.id)
      token.push(refreshToken)
      resolve({
        err: accessToken ? 200 : 403,
        msg: accessToken
          ? "Login is successfully !"
          : response
            ? "Password is wrong !"
            : "Phone number or email not found !",
        accessToken: accessToken || null,
        refreshToken: refreshToken || null,
        role: response?.role
      });
    } catch (error) {
      reject(error)
    }
  })
}


const getUserServices = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.findOne({
        where: { id },
        raw: true,
        attributes: {
          exclude: ["password"]
        }
      })

      resolve({
        err: response ? 0 : 1,
        msg: response ? "Get user success" : "Get user failed",
        detail: response
      })
    } catch (error) {
      reject(error)
    }
  })
}

const loginAdmin = ({ emailOrPhone, password }) => {
  let token = []
  return new Promise(async (resolve, reject) => {
    try {
      const res = await db.User.findOne({
        where: { emailOrPhone },
        raw: true
      })
      const convertPassword = res && bcrypt.compareSync(password, res.password);
      const accessToken = convertPassword && generateAccessToken(res?.id)
      const refreshToken = accessToken && generateRefeshToken(res.id)
      token.push(refreshToken)
      if (res?.role === "admin") {
        resolve({
          code: accessToken && 200,
          msg: accessToken && 'Bạn là Admin',
          data: res,
          accessToken: accessToken || null,
          refreshToken: refreshToken || null,
          role: res.role
        })
      } else {
        resolve({
          code: 500,
          msg: 'Bạn không có quyền truy cập vào đây'
        })
      }
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  registerService,
  loginServices,
  getUserServices,
  loginAdmin
}