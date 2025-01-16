const express = require('express')
const authController = require('../controller/authController')
const { verifyToken } = require('../middleware/checkAuth')
const { checkAdmin } = require('../middleware/checkAmin')
const router = express.Router()

const authRouter = (app) => {
  router.post('/register', authController.register)
  router.post('/login', authController.loginController)
  router.post('/createAddress', authController.createAddress)
  router.get('/getAddress', verifyToken, authController.getAdress)
  router.get('/getUser', verifyToken, authController.getUserController)
  router.post('/rftk', authController.refreshToken)
  router.post('/logout', authController.logoutController)
  router.put('/update_user', verifyToken, authController.updateUser)
  router.get('/getAllUser', verifyToken, authController.getAllUserAdmin)
  //admin
  router.post('/adPanel', authController.loginAdmin)
  return app.use('/', router)
}

module.exports = {
  authRouter
}