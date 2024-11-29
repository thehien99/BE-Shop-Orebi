const { Json } = require('sequelize/lib/utils')
const db = require('../models/index')
const { v4 } = require('uuid')
const { where } = require('sequelize')

const addProduct = ({
  name,
  size,
  imageId,
  brand,
  quantity,
  description,
  salePrice,
  price,
  totalSock,
  color }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const imagesId = await db.Image.create({
        id: v4(),
        image: imageId
      })

      imageId = imagesId?.id

      const response = await db.Product.create({
        id: v4(),
        name,
        description,
        price,
        quantity,
        brand,
        color: [color],
        size: [size],
        imageId,
        salePrice,
        totalSock
      })
      resolve({
        code: 200,
        msg: 'Create success',
        response
      })
    } catch (error) {
      reject(error)
    }
  })
}

const updateProduct = (productId, {
  name,
  size,
  imageId,
  brand,
  quantity,
  description,
  salePrice,
  price,
  totalSock,
  color }) => {

  return new Promise(async (resolve, reject) => {
    try {
      await db.Product.update({
        name,
        description,
        price,
        quantity,
        brand,
        color: [color],
        size: [size],
        salePrice,
        totalSock,
        imageId
      }, { where: { id: productId } })

      await db.Image.update({

      })

      resolve({
        code: 200,
        response
      })
    } catch (error) {
      console.log(error)
    }
  })
}

const getProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await db.Product.findOne({
        where: { id }
      })
      const productImg = await db.Image.findOne({
        where: { id: res.imageId }
      })

      if (!res) {
        return resolve({
          msg: 'Not found Id'
        })
      }
      resolve({
        code: 200,
        msg: 'get product success',
        payload: { ...res.dataValues, productImg }
      })
    } catch (error) {
      reject(error)
    }
  })
}

const getAllProduct = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await db.Product.findAll()

      const productImg = await Promise.all(
        res.map(async (item) => {
          const img = await db.Image.findOne({
            where: { id: item.imageId }
          })
          return { ...item.dataValues, image: img.image }
        })
      )
      resolve(productImg)
    } catch (error) {
      reject(error)
    }
  })

}
module.exports = {
  addProduct,
  updateProduct,
  getProduct,
  getAllProduct
}