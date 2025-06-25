const { User, Post, Project, Download } = require('../models');
const { Op } = require('sequelize');

/**
 * Obter todos os utilizadores (apenas admin)
 */
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt', 
      order = 'DESC',
      role,
      active,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Construir condições de filtro
    const where = {};
    
    if (role) {
      where.role = role;
    }
    
    if (active !== undefined) {
      where.isActive = active === 'true';
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order.toUpperCase()]],
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] }
    });

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao obter utilizadores:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter utilizador por ID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
      include: [
        {
          model: Post,
          as: 'posts',
          where: { isPublished: true },
          required: false,
          limit: 5,
          order: [['createdAt', 'DESC']]
        },
        {
          model: Project,
          as: 'projects',
          where: { isPublished: true },
          required: false,
          limit: 5,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        error: 'Utilizador não encontrado'
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Erro ao obter utilizador:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Criar novo utilizador (apenas admin)
 */
const createUser = async (req, res) => {
  try {
    const userData = req.body;

    // Verificar se o utilizador já existe
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      return res.status(400).json({
        error: 'Utilizador já existe com este email'
      });
    }

    const user = await User.create(userData);

    res.status(201).json({
      message: 'Utilizador criado com sucesso',
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Erro ao criar utilizador:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualizar utilizador
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: 'Utilizador não encontrado'
      });
    }

    // Verificar permissões
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        error: 'Permissão insuficiente'
      });
    }

    // Apenas admin pode alterar role e isActive
    if (req.user.role !== 'admin') {
      delete updateData.role;
      delete updateData.isActive;
    }

    // Verificar se o email já está em uso por outro utilizador
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ 
        where: { 
          email: updateData.email,
          id: { [Op.ne]: id }
        } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          error: 'Email já está em uso'
        });
      }
    }

    await user.update(updateData);

    res.json({
      message: 'Utilizador atualizado com sucesso',
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Erro ao atualizar utilizador:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Eliminar utilizador (apenas admin)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: 'Utilizador não encontrado'
      });
    }

    // Não permitir que o admin elimine a própria conta
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        error: 'Não pode eliminar a própria conta'
      });
    }

    await user.destroy();

    res.json({
      message: 'Utilizador eliminado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao eliminar utilizador:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter estatísticas do utilizador
 */
const getUserStats = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: 'Utilizador não encontrado'
      });
    }

    // Verificar permissões
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        error: 'Permissão insuficiente'
      });
    }

    const [postsCount, projectsCount, downloadsCount] = await Promise.all([
      Post.count({ where: { userId: id } }),
      Project.count({ where: { userId: id } }),
      Download.count({ where: { userId: id } })
    ]);

    const totalViews = await Post.sum('viewCount', { where: { userId: id } }) || 0;

    res.json({
      stats: {
        postsCount,
        projectsCount,
        downloadsCount,
        totalViews
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats
};

