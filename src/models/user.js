'use strict';
const {
  Model,
  ARRAY
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
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
      User.hasMany(models.Order, {
        foreignKey: 'userId',
        as: 'orders'
      })
      User.hasOne(models.Address, {
        foreignKey: 'userId',
        as: 'address'
      })
    }
  }
  User.init({
    name: DataTypes.STRING,
    emailOrPhone: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};