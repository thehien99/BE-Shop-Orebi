const express = require('express')
const productController = require('../controller/productController')
const { upload } = require('../helper/coudinary')
const { verifyToken } = require('../middleware/checkAuth')
const router = express.Router()


const productRouter = (app) => {
  router.post('/upload', upload.single("file"), productController.uploadFile)
  router.post('/addProduct', productController.addProduct)
  router.get('/getallProduct', productController.getAllProduct)
  router.put('/update', productController.updateProduct)
  router.get('/getProduct', productController.getProduct)
  router.get('/search', productController.searchProduct)
  router.post('/orderProduct', productController.orderProduct)
  router.get('/getAllOrder', verifyToken, productController.getAllOrder)

  return app.use('/', router)
}

module.exports = {
  productRouter
}