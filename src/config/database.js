const { Sequelize } = require('sequelize');
require('dotenv').config();

// Para testes, usar SQLite se MySQL não estiver disponível
const sequelize = process.env.NODE_ENV === 'test' ? 
  new Sequelize({
    dialect: 'sqlite',
    storage: './test.db',
    logging: false
  }) :
  new Sequelize(
    process.env.DB_NAME || 'portfolio_db',
    process.env.DB_USER || 'portfolio_user',
    process.env.DB_PASSWORD || 'portfolio_password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306, 
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );

// Testar a conexão
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com a base de dados estabelecida com sucesso.');
  } catch (error) {
    console.error('❌ Erro ao conectar com a base de dados:', error);
  }
};

module.exports = { sequelize, testConnection };

