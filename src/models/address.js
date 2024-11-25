'use strict';
const {
  Model,
  ARRAY
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
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
      Address.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'users'
      })
      Address.hasOne(models.Order, {
        foreignKey: 'shippingAddressId',
        as: 'orders'
      })
    }
  }
  Address.init({
    userId: DataTypes.STRING,
    address: DataTypes.STRING,
    phone: DataTypes.INTEGER,
    notes: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Address',
  });
  return Address;
};