const { Project, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Obter todos os projetos com paginação e filtros
 */
const getAllProjects = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt', 
      order = 'DESC',
      category,
      status,
      published,
      featured,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Construir condições de filtro
    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (published !== undefined) {
      where.isPublished = published === 'true';
    }
    
    if (featured !== undefined) {
      where.isFeatured = featured === 'true';
    }
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { fullDescription: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Se não for admin/editor, mostrar apenas projetos publicados
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      where.isPublished = true;
    }

    const { count, rows: projects } = await Project.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ['isFeatured', 'DESC'],
        ['sortOrder', 'ASC'],
        [sort, order.toUpperCase()]
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ]
    });

    res.json({
      projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao obter projetos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter projeto por slug
 */
const getProjectBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const project = await Project.findOne({
      where: { slug },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        error: 'Projeto não encontrado'
      });
    }

    // Se não for admin/editor e o projeto não estiver publicado, negar acesso
    if (!project.isPublished && (!req.user || !['admin', 'editor'].includes(req.user.role))) {
      return res.status(404).json({
        error: 'Projeto não encontrado'
      });
    }

    // Incrementar contador de visualizações
    await project.increment('viewCount');

    res.json({ project });
  } catch (error) {
    console.error('Erro ao obter projeto:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Criar novo projeto
 */
const createProject = async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      userId: req.user.id
    };

    // Verificar se o slug já existe
    const existingProject = await Project.findOne({ where: { slug: projectData.slug } });
    if (existingProject) {
      return res.status(400).json({
        error: 'Slug já existe. Escolha um slug único.'
      });
    }

    const project = await Project.create(projectData);

    // Buscar o projeto criado com as associações
    const createdProject = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ]
    });

    res.status(201).json({
      message: 'Projeto criado com sucesso',
      project: createdProject
    });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualizar projeto
 */
const updateProject = async (req, res) => {
  try {
    const { slug } = req.params;
    const updateData = req.body;

    const project = await Project.findOne({ where: { slug } });

    if (!project) {
      return res.status(404).json({
        error: 'Projeto não encontrado'
      });
    }

    // Verificar permissões
    if (req.user.role !== 'admin' && req.user.role !== 'editor' && project.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Permissão insuficiente'
      });
    }

    // Se o slug está sendo alterado, verificar se o novo slug já existe
    if (updateData.slug && updateData.slug !== project.slug) {
      const existingProject = await Project.findOne({ where: { slug: updateData.slug } });
      if (existingProject) {
        return res.status(400).json({
          error: 'Slug já existe. Escolha um slug único.'
        });
      }
    }

    await project.update(updateData);

    // Buscar o projeto atualizado com as associações
    const updatedProject = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ]
    });

    res.json({
      message: 'Projeto atualizado com sucesso',
      project: updatedProject
    });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Eliminar projeto
 */
const deleteProject = async (req, res) => {
  try {
    const { slug } = req.params;

    const project = await Project.findOne({ where: { slug } });

    if (!project) {
      return res.status(404).json({
        error: 'Projeto não encontrado'
      });
    }

    // Verificar permissões
    if (req.user.role !== 'admin' && req.user.role !== 'editor' && project.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Permissão insuficiente'
      });
    }

    await project.destroy();

    res.json({
      message: 'Projeto eliminado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao eliminar projeto:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter categorias de projetos
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Project.findAll({
      attributes: ['category'],
      where: {
        category: { [Op.ne]: null },
        isPublished: true
      },
      group: ['category'],
      raw: true
    });

    const categoryList = categories.map(item => item.category).filter(Boolean);

    res.json({ categories: categoryList });
  } catch (error) {
    console.error('Erro ao obter categorias:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter tecnologias utilizadas nos projetos
 */
const getTechnologies = async (req, res) => {
  try {
    const projects = await Project.findAll({
      attributes: ['technologies'],
      where: {
        technologies: { [Op.ne]: null },
        isPublished: true
      },
      raw: true
    });

    const allTechnologies = projects.reduce((acc, project) => {
      if (project.technologies && Array.isArray(project.technologies)) {
        acc.push(...project.technologies);
      }
      return acc;
    }, []);

    const uniqueTechnologies = [...new Set(allTechnologies)];

    res.json({ technologies: uniqueTechnologies });
  } catch (error) {
    console.error('Erro ao obter tecnologias:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  getCategories,
  getTechnologies
};

