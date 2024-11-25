'use strict';
const {
  Model,
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // static associate(models) {
    //   // define association here
    //   User.hasMany(models.Post, { foreignKey: 'userId', as: 'Users' })
    // }
    static associate(models) {
      Order.hasMany(models.OrderItem, {
        foreignKey: 'orderId',
        as: 'order'
      })
      Order.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'users'
      })
      Order.belongsTo(models.Address, {
        foreignKey: 'shippingAddressId',
        as: 'addresss'
      })
    }
  }
  Order.init({
    userId: DataTypes.STRING,
    shippingAddressId: DataTypes.STRING,
    paymentMethod: DataTypes.STRING,
    paymentResult: DataTypes.JSONB,
    itemPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0
    },
    shippingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      default: false
    },
    paidAt: {
      type: DataTypes.DATE
    },
    isDelivered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deliveredAt: {
      type: DataTypes.DATE,
    }
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};