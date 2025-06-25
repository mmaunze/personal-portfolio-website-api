const { sequelize } = require('../config/database');

// Importar todos os modelos
const User = require('./User');
const Post = require('./Post');
const Project = require('./Project');
const Download = require('./Download');
const Contact = require('./Contact');

// Definir associações entre modelos
// Um utilizador pode ter muitos posts
User.hasMany(Post, {
  foreignKey: 'userId',
  as: 'posts'
});
Post.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Um utilizador pode ter muitos projetos
User.hasMany(Project, {
  foreignKey: 'userId',
  as: 'projects'
});
Project.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Um utilizador pode ter muitos downloads
User.hasMany(Download, {
  foreignKey: 'userId',
  as: 'downloads'
});
Download.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Exportar todos os modelos e a instância do sequelize
module.exports = {
  sequelize,
  User,
  Post,
  Project,
  Download,
  Contact
};

