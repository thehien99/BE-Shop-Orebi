
'use strict';

const { DataTypes, ARRAY } = require("sequelize");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      imageId: {
        type: Sequelize.STRING,
        references: {
          model: 'Images',  // Bảng User mà bạn muốn tham chiếu
          key: 'id',       // Khóa chính của bảng image
        },
      },
      brand: {
        type: Sequelize.STRING,
      },
      quantity: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.INTEGER
      },
      salePrice: {
        type: Sequelize.INTEGER
      },
      totalSock: {
        type: Sequelize.INTEGER
      },
      color: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      size: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  }
};