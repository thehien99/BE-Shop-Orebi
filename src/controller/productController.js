const { Op, Sequelize } = require('sequelize')
const { imageUpload } = require('../helper/coudinary')
const db = require('../models')
const productServices = require('../services/productServices')
const { v4 } = require('uuid')
const { broadcastMessage } = require('../websockets/websocket')

//thêm sản phẩm
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


//up hình lên cloud
const uploadFile = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64")
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUpload(url)
    return res.json({
      success: true,
      url: result.secure_url
    })

  } catch (error) {
    console.log(error)
  }
}


//Lấy tất cả product
const getAllProduct = async (req, res) => {
  try {
    const response = await productServices.getAllProduct()
    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
  }
}

//cập nhật product
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



//lấy sản phẩm theo id
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

//tìm kiếm product
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

//đặt hàng
const orderProduct = async (req, res) => {
  const { userId, shippingAddressId, items, paymentMethod } = req.body;

  try {
    const user = await db.User.findByPk(userId);
    const addressShip = await db.Address.findByPk(shippingAddressId);

    if (!user || !addressShip) {
      return res.status(500).json('Not found user or address');
    }

    let totalProduct = 0.0;
    let priceProduct = 0;

    // Process order items
    const orderItems = await Promise.all(
      items?.map(async (item) => {
        const product = await db.Product.findOne({
          where: { id: item?.id },
        });
        const products = product.dataValues;
        if (!products || parseFloat(item?.quantity >= products.totalSock)) {
          throw new Error(`Product ${item?.id} is not available in sufficient quantity`);
        }

        totalProduct = item?.priceProduct;
        priceProduct = products.price;
        return {
          id: v4(),
          productId: item?.id,
          name: products.name,
          quantity: item?.quanti,
          price: priceProduct,
          imageId: products?.imageId,
        };
      })
    );

    // Create order in database
    const createOrder = await db.Order.create({
      id: v4(),
      userId,
      shippingAddressId,
      paymentMethod,
      itemPrice: priceProduct,
      shippingPrice: 0,
      totalPrice: totalProduct,
      isPaid: false,
      isDelivered: false,
    });

    // Add order items to database
    await Promise.all(
      orderItems.map(async (item) => {
        await db.OrderItem.create({
          ...item,
          orderId: createOrder.id,
        });

        // Update product stock
        const product = await db.Product.findOne({
          where: { id: item?.productId },
        });
        product.totalSock -= item.quantity;
        product.quantity -= item.quantity;
        await product.save();
      })
    );

    // Send notification to all admins
    broadcastMessage({
      type: 'NEW_ORDER',
      data: {
        orderId: createOrder.id,
        userId,
        items: orderItems,
        totalPrice: totalProduct,
      },
    });

    return res.status(200).json({
      msg: 'Create success',
      createOrder,
    });
  } catch (error) {
    console.log(error);
  }
};


const getAllOrder = async (req, res) => {
  const userId = req.user
  if (!userId) {
    return res.status(401).json('token error')
  }
  try {
    const order = await db.Order.findAll({
      where: { userId: userId },
      raw: true,
      attributes: {
        exclude: ['paymentResult', 'createdAt', 'updatedAt']
      }
    })

    const orderItems = await Promise.all(
      order.map(async (item) => {
        const response = await db.OrderItem.findOne({
          where: { orderId: item.id },
          attributes: {
            exclude: ['orderId', 'productId', 'createdAt', 'updatedAt']
          }
        });

        // Kiểm tra nếu không tìm thấy OrderItem
        if (!response) {
          console.warn(`OrderItem not found for orderId: ${item.id}`);
          return { ...item, orderItem: null };
        }

        return { ...item, orderItem: response };
      })
    );


    const image = await Promise.all(
      orderItems.map(async (item) => {
        if (!item.orderItem) {
          console.warn(`Missing orderItem for orderId: ${item.id}`);
          return { ...item, image: null };
        }

        const image = await db.Image.findOne({
          where: { id: item.orderItem.imageId },
          raw: true
        });

        return { ...item, image: image ? image.image : null };
      })
    );


    const response = await Promise.all(
      image.map(async (item) => {
        const address = await db.Address.findOne({
          where: { id: item.shippingAddressId },
          raw: true
        })
        return { ...item, address: address.address }
      })
    )
    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
  }
}

const deleteProduct = async (req, res) => {
  const { id } = req.body
  if (!id) {
    return res.status(500).json({
      msg: 'id not found'
    })
  }
  try {
    const response = await db.Product.findOne({
      where: { id: id }
    })
    if (!response) {
      return res.status(500).json({
        msg: 'Product not found'
      })
    }
    await response.destroy()
    return res.status(200).json({
      code: 1,
      msg: 'Delete product success'
    })
  } catch (error) {
    console.log(error)
  }
}


const getAllOrderUser = async (req, res) => {
  try {
    const getAllOrder = await db.Order.findAll({
      attributes: {
        exclude: ['_previousDataValues', 'uniqno', '_changed', '_options', 'isNewRecord']
      }
    })

    const findUser = await Promise.all(
      getAllOrder.map(async (item) => {
        const res = await db.User.findOne({
          where: { id: item?.userId },
          attributes: {
            exclude: ['password', 'createdAt', 'updatedAt', 'id']
          }
        })
        return { ...item.dataValues, user: res }
      })
    )
    const findAddress = await Promise.all(
      findUser?.map(async (item) => {
        const res = await db.Address.findOne({
          where: { userId: item?.userId },
          attributes: {
            exclude: ['id', 'userId', 'createdAt', 'updatedAt']
          }

        })
        return { ...item, address: res }
      })
    )

    const findOrderItem = await Promise.all(
      findAddress?.map(async (item) => {
        const res = await db.OrderItem.findOne({
          where: { orderId: item?.id },
          attributes: {
            exclude: ['updatedAt', 'createdAt', 'id', 'orderId']
          }
        })
        return { ...item, orderItem: res }
      })
    )

    const findImage = await Promise.all(
      findOrderItem?.map(async (item) => {
        const res = await db.Image.findOne({
          where: { id: item?.orderItem?.imageId },
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'id']
          }
        })
        return { ...item, image: res.image }
      })
    )
    return res.status(200).json({
      data: findImage,
    })
  } catch (error) {
    console.log(error)
  }
}


const updateIsDelivered = async (req, res) => {
  console.log('Request Body:', req.body); // Kiểm tra dữ liệu nhận được
  const id = req.user;
  const { productId, isDelivered } = req.body;

  if (!id) {
    return res.status(401).json({ msg: 'Token error' });
  }

  if (!productId || typeof isDelivered === 'undefined') {
    return res.status(400).json({ msg: 'Missing productId or isDelivered' });
  }

  try {
    const response = await db.Order.update(
      { isDelivered },
      { where: { id: productId } }
    );
    return res.status(200).json(response);
  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ msg: 'Internal server error' });
  }
};

module.exports = {
  addProduct,
  uploadFile,
  getAllProduct,
  updateProduct,
  getProduct,
  searchProduct,
  orderProduct,
  getAllOrder,
  deleteProduct,
  getAllOrderUser,
  updateIsDelivered
}