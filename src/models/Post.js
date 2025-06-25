const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Títulos devem ser únicos
  },
  slug: { // Para URLs amigáveis (ex: /blog/meu-titulo-de-artigo)
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  excerpt: { // Pequeno resumo
    type: DataTypes.TEXT,
    allowNull: true
  },
  fullContent: { // Conteúdo completo do artigo (pode ser HTML, Markdown, etc.)
    type: DataTypes.TEXT('long'), // 'long' para textos grandes
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  publishDate: {
    type: DataTypes.DATEONLY, // Apenas data (AAAA-MM-DD)
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tags: { // Pode ser um array de strings armazenado como JSON
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'posts', // Nome da tabela no banco de dados
  timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

module.exports = Post;

