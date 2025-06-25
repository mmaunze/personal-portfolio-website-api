const jwt = require('jsonwebtoken');

/**
 * Gerar token JWT
 * @param {Object} payload - Dados a serem incluídos no token
 * @param {String} expiresIn - Tempo de expiração (opcional)
 * @returns {String} Token JWT
 */
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verificar token JWT
 * @param {String} token - Token a ser verificado
 * @returns {Object} Payload decodificado
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Gerar token de acesso
 * @param {Object} user - Objeto do utilizador
 * @returns {String} Token de acesso
 */
const generateAccessToken = (user) => {
  return generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });
};

/**
 * Gerar token de refresh
 * @param {Object} user - Objeto do utilizador
 * @returns {String} Token de refresh
 */
const generateRefreshToken = (user) => {
  return generateToken({
    id: user.id,
    type: 'refresh'
  }, '30d');
};

/**
 * Extrair token do cabeçalho Authorization
 * @param {String} authHeader - Cabeçalho Authorization
 * @returns {String|null} Token extraído ou null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

module.exports = {
  generateToken,
  verifyToken,
  generateAccessToken,
  generateRefreshToken,
  extractTokenFromHeader
};

