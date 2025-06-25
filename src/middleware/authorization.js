/**
 * Middleware para verificar autorização baseada em roles
 * @param {Array|String} allowedRoles - Roles permitidos
 * @returns {Function} Middleware de autorização
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticação necessária'
      });
    }

    // Converter para array se for string
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Permissão insuficiente'
      });
    }

    next();
  };
};

/**
 * Middleware para verificar se o utilizador é admin
 */
const requireAdmin = authorize(['admin']);

/**
 * Middleware para verificar se o utilizador é admin ou editor
 */
const requireEditor = authorize(['admin', 'editor']);

/**
 * Middleware para verificar se o utilizador é o proprietário do recurso ou admin
 * @param {String} resourceUserField - Campo que contém o ID do utilizador proprietário
 * @returns {Function} Middleware de autorização
 */
const requireOwnershipOrAdmin = (resourceUserField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticação necessária'
      });
    }

    // Admin pode aceder a tudo
    if (req.user.role === 'admin') {
      return next();
    }

    // Verificar se o utilizador é o proprietário
    const resourceUserId = req.resource ? req.resource[resourceUserField] : null;
    
    if (resourceUserId && resourceUserId === req.user.id) {
      return next();
    }

    return res.status(403).json({
      error: 'Acesso negado. Apenas o proprietário ou admin pode aceder a este recurso.'
    });
  };
};

/**
 * Middleware para verificar se o utilizador pode editar o recurso
 * (proprietário, editor ou admin)
 */
const canEdit = (resourceUserField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticação necessária'
      });
    }

    // Admin e editor podem editar tudo
    if (['admin', 'editor'].includes(req.user.role)) {
      return next();
    }

    // Verificar se o utilizador é o proprietário
    const resourceUserId = req.resource ? req.resource[resourceUserField] : null;
    
    if (resourceUserId && resourceUserId === req.user.id) {
      return next();
    }

    return res.status(403).json({
      error: 'Permissão insuficiente para editar este recurso.'
    });
  };
};

module.exports = {
  authorize,
  requireAdmin,
  requireEditor,
  requireOwnershipOrAdmin,
  canEdit
};

