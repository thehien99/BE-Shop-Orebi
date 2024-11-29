const { QueryError, Op, where, Model, Sequelize } = require('sequelize')
const { imageUpload } = require('../helper/coudinary')
const db = require('../models')
const productServices = require('../services/productServices')
const { v4 } = require('uuid')
const elasticClient = require('../elasticSearch/elasticSearch')
const { query } = require('express')



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
  console.log(id)
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
  try {
    // Lấy query từ request
    const { page = 1, limit = 10, q, w } = req.query;

    // Tính toán offset và limit
    const offset = (page - 1) * limit;

    // Hàm kiểm tra nếu từ khóa không chứa dấu
    const isNoAccent = (str) => /[a-zA-Z0-9]/.test(str) && !/[àáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/.test(str);

    // Xây dựng điều kiện tìm kiếm cho nhiều từ khóa
    const keywords = Object.values(req.query).filter((value) => value.trim() !== '');
    const whereConditions = keywords.map((value) => {
      if (isNoAccent(value)) {
        // Nếu không có dấu, tìm kiếm không dấu (sử dụng unaccent)
        return Sequelize.where(
          Sequelize.fn('unaccent', Sequelize.col('name')),
          { [Op.iLike]: `%${value}%` }
        );
      } else {
        // Nếu có dấu, tìm kiếm có dấu
        return {
          name: { [Op.iLike]: `%${value}%` }
        };
      }
    });

    // Nếu không có điều kiện tìm kiếm hợp lệ, trả về lỗi
    if (whereConditions.length === 0) {
      return res.status(400).json({ message: 'Invalid search parameters.' });
    }

    // Sử dụng findAndCountAll để tìm kiếm
    const products = await db.Product.findAndCountAll({
      where: {
        [Op.or]: whereConditions, // Kết hợp điều kiện OR
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Lấy ảnh từ bảng Image
    const productImg = await Promise.all(
      products.rows.map(async (item) => {
        const img = await db.Image.findOne({
          where: { id: item.imageId },
        });
        return { ...item.dataValues, image: img ? img.image : null };
      })
    );

    // Trả về kết quả
    return res.status(200).json({
      data: productImg,
      total: products.count,
      totalPages: Math.ceil(products.count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error('Error searching products:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};


module.exports = {
  addProduct, uploadFile, getAllProduct, updateProduct,
  deleteProduct,
  getProduct,
  searchProduct
}