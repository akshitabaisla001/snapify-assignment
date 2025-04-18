const sequelize = require('../config/database');
const User = require('./userModel');
const Photo = require('./photoModel');

// Define associations
User.hasMany(Photo, {
  foreignKey: 'userId',
  as: 'photos',
  onDelete: 'CASCADE',
});

Photo.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

module.exports = {
  sequelize,
  User,
  Photo,
};