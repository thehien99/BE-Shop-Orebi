'use strict';
const {
  Model,
  ARRAY
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // static associate(models) {
    //   // define association here
    //   User.hasMany(models.Post, { foreignKey: 'userId', as: 'Users' })
    // }
    static associations(models) {
      Product.belongsTo(models.Image, {
        foreignKey: 'imagesId',
        as: 'images'
      })
      Product.hasOne(models.OrderItem, {
        foreignKey: 'productId',
        as: 'orderItems'
      })

    }
  }
  Product.init({
    name: DataTypes.STRING,
    imageId: DataTypes.STRING,
    brand: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    description: DataTypes.STRING,
    price: DataTypes.INTEGER,
    salePrice: DataTypes.INTEGER,
    totalSock: DataTypes.INTEGER,
    color: DataTypes.ARRAY(DataTypes.STRING),
    size: DataTypes.ARRAY(DataTypes.STRING)
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};