const { User } = require('../models');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');

/**
 * Registar novo utilizador
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar se o utilizador já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        error: 'Utilizador já existe com este email'
      });
    }

    // Criar novo utilizador
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'viewer'
    });

    // Gerar tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      message: 'Utilizador criado com sucesso',
      user: user.toPublicJSON(),
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Erro no registo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Login de utilizador
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar utilizador por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Verificar se a conta está ativa
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Conta desativada'
      });
    }

    // Verificar password
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Atualizar último login
    await user.update({ lastLogin: new Date() });

    // Gerar tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      message: 'Login realizado com sucesso',
      user: user.toPublicJSON(),
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Renovar token de acesso
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token necessário'
      });
    }

    // Verificar refresh token
    const decoded = verifyToken(refreshToken);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    // Buscar utilizador
    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Utilizador não encontrado ou inativo'
      });
    }

    // Gerar novo access token
    const newAccessToken = generateAccessToken(user);

    res.json({
      accessToken: newAccessToken
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Refresh token inválido ou expirado'
      });
    }

    console.error('Erro ao renovar token:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter perfil do utilizador autenticado
 */
const getProfile = async (req, res) => {
  try {
    res.json({
      user: req.user.toPublicJSON()
    });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualizar perfil do utilizador autenticado
 */
const updateProfile = async (req, res) => {
  try {
    const { name, email, bio, avatar } = req.body;
    const user = req.user;

    // Verificar se o email já está em uso por outro utilizador
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        where: { 
          email,
          id: { [require('sequelize').Op.ne]: user.id }
        } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          error: 'Email já está em uso'
        });
      }
    }

    // Atualizar dados do utilizador
    await user.update({
      name: name || user.name,
      email: email || user.email,
      bio: bio !== undefined ? bio : user.bio,
      avatar: avatar !== undefined ? avatar : user.avatar
    });

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Alterar password do utilizador autenticado
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Verificar password atual
    const isCurrentPasswordValid = await user.checkPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Password atual incorreta'
      });
    }

    // Atualizar password
    await user.update({ password: newPassword });

    res.json({
      message: 'Password alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar password:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Logout (invalidar token - implementação básica)
 */
const logout = async (req, res) => {
  try {
    // Em uma implementação mais robusta, você manteria uma blacklist de tokens
    // Por agora, apenas retornamos sucesso
    res.json({
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  logout
};

