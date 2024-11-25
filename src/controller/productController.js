const { QueryError, Op } = require('sequelize')
const { imageUpload } = require('../helper/coudinary')
const db = require('../models')
const productServices = require('../services/productServices')
const { v4 } = require('uuid')
const elasticClient = require('../elasticSearch/elasticSearch')



const addProduct = async (req, res) => {
  const { name,
    size,
    imageId,
    brand,
    quantity,
    description,
    salePrice,
    price,
    totalSock,
    color } = req.body

  if (!name || !description || !price || !quantity) {
    return res.status(403).json({
      msg: 'Tạo sản phẩm không thành công'
    })
  }
  try {
    const response = await productServices.addProduct(req.body)
    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
  }
}

const uploadFile = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64")
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUpload(url)
    console.log(result)
    return res.json({
      success: true,
      url: result.secure_url
    })

  } catch (error) {
    console.log(error)
  }
}

const getAllProduct = async (req, res) => {
  try {
    const response = await productServices.getAllProduct()
    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
  }
}

const updateProduct = async (req, res) => {
  const { productId } = req.query
  const { name,
    size,
    imageId,
    brand,
    quantity,
    description,
    salePrice,
    price,
    totalSock,
    color } = req.body

  if (!productId) {
    return res.status(500).json({ msg: 'Error' })
  }
  try {
    const response = await productServices.updateProduct(
      productId, req.body
    )
    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
  }
}

const deleteProduct = () => {

}


const getProduct = async (req, res) => {
  const { id } = req.query
  if (!id) {
    return res.status(403).json({
      msg: 'Error'
    })
  }
  try {
    const response = await productServices.getProduct(id)
    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
  }
}

const searchProduct = async (req, res) => {
  const query = req.query.search
  console.log(query)
  if (!query) {
    return res.status(500).json({
      msg: 'Error'
    })
  }
  try {
    // const response = await elasticClient.search({
    //   index: 'products',
    //   body: {
    //     query: {
    //       multi_match: {
    //         query,
    //         fields: ['name']
    //       }
    //     }
    //   }
    // })
    // const hits = response.body.hits.hits.map((hit) => hit._source);
    // return res.json(hits)

    const response = await db.Product.findAll({
      where: {
        name: {
          [Op.iLike]: `%${query}%`
        }
      }
    })
    const productImg = await Promise.all(
      response.map(async (item) => {
        const img = await db.Image.findOne({
          where: { id: item?.imageId }
        })
        return { ...item.dataValues, img: img.image }
      })
    )
    return res.status(200).json({
      msg: 'Success',
      productImg
    })
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  addProduct, uploadFile, getAllProduct, updateProduct,
  deleteProduct,
  getProduct,
  searchProduct
}