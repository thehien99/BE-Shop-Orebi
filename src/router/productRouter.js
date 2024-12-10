const express = require('express')
const productController = require('../controller/productController')
const { upload } = require('../helper/coudinary')
const router = express.Router()


const productRouter = (app) => {
  router.post('/upload', upload.single("file"), productController.uploadFile)
  router.post('/addProduct', productController.addProduct)
  router.get('/getallProduct', productController.getAllProduct)
  router.put('/update', productController.updateProduct)
  router.delete('/deletePd', productController.deleteProduct)
  router.get('/getProduct', productController.getProduct)
  router.get('/search', productController.searchProduct)


  return app.use('/', router)
}

module.exports = {
  productRouter
}