'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Image.hasMany(models.Product,
        {
          foreignKey: 'imageId',
          as: 'images',
        }
      )
      Image.hasOne(models.OrderItem, {
        foreignKey: 'imageId',
        as: 'orderItems'
      })

    }
  }
  Image.init({
    image: DataTypes.ARRAY(DataTypes.TEXT),
  }, {
    sequelize,
    modelName: 'Image',
  });
  return Image;
};