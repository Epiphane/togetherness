'use strict';

var crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {
   return sequelize.define('pebble', {
      _id: {
         type: DataTypes.INTEGER,
         allowNull: false,
         primaryKey: true,
         autoIncrement: true
      },
      info: {
         type: DataTypes.JSON,
         allowNull: false
      }
   });
};