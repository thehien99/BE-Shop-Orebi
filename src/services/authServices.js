const bcrypt = require("bcryptjs/dist/bcrypt");
const db = require("../models");
const { Op, UUID, where, Sequelize } = require("sequelize");
const { v4 } = require("uuid");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefeshToken } = require("./token");

const registerService = ({ name, emailOrPhone, password }) => {
  return new Promise(async (resolve, reject) => {
    const hashPassword = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(12));

    try {
      const [user, response] = await db.User.findOrCreate({
        where: { emailOrPhone },
        defaults: {
          name, emailOrPhone,
          password: hashPassword(password),
          id: v4()
        }
      })
      const accessTokentoken = response && generateAccessToken(response?.id)
      const refreshToken = accessTokentoken && generateRefeshToken(response?.id)
      if (response) {
        return resolve({
          status: 200,
          msg: 'Create success',
          user,
          accessTokentoken,
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
        refreshToken: refreshToken || null
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

module.exports = {
  registerService,
  loginServices,
  getUserServices
}