'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      OrderItem.belongsTo(models.Image, {
        // define association here
        foreignKey: 'imageId',
        as: 'images'
      })
      OrderItem.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'user'
      })

      OrderItem.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product'
      })

    }
  }
  OrderItem.init({
    imageId: DataTypes.STRING,
    orderId: DataTypes.STRING,
    name: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    price: DataTypes.DECIMAL,
    productId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'OrderItem',
  });
  return OrderItem;
};