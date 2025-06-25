const { Post, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Obter todos os posts com paginação e filtros
 */
const getAllPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt', 
      order = 'DESC',
      category,
      author,
      published,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Construir condições de filtro
    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (author) {
      where.author = { [Op.iLike]: `%${author}%` };
    }
    
    if (published !== undefined) {
      where.isPublished = published === 'true';
    }
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { excerpt: { [Op.iLike]: `%${search}%` } },
        { fullContent: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Se não for admin/editor, mostrar apenas posts publicados
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      where.isPublished = true;
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order.toUpperCase()]],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ]
    });

    res.json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao obter posts:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter post por slug
 */
const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({
      where: { slug },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        error: 'Post não encontrado'
      });
    }

    // Se não for admin/editor e o post não estiver publicado, negar acesso
    if (!post.isPublished && (!req.user || !['admin', 'editor'].includes(req.user.role))) {
      return res.status(404).json({
        error: 'Post não encontrado'
      });
    }

    // Incrementar contador de visualizações
    await post.increment('viewCount');

    res.json({ post });
  } catch (error) {
    console.error('Erro ao obter post:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Criar novo post
 */
const createPost = async (req, res) => {
  try {
    const postData = {
      ...req.body,
      userId: req.user.id
    };

    // Verificar se o slug já existe
    const existingPost = await Post.findOne({ where: { slug: postData.slug } });
    if (existingPost) {
      return res.status(400).json({
        error: 'Slug já existe. Escolha um slug único.'
      });
    }

    const post = await Post.create(postData);

    // Buscar o post criado com as associações
    const createdPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ]
    });

    res.status(201).json({
      message: 'Post criado com sucesso',
      post: createdPost
    });
  } catch (error) {
    console.error('Erro ao criar post:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualizar post
 */
const updatePost = async (req, res) => {
  try {
    const { slug } = req.params;
    const updateData = req.body;

    const post = await Post.findOne({ where: { slug } });

    if (!post) {
      return res.status(404).json({
        error: 'Post não encontrado'
      });
    }

    // Verificar permissões
    if (req.user.role !== 'admin' && req.user.role !== 'editor' && post.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Permissão insuficiente'
      });
    }

    // Se o slug está sendo alterado, verificar se o novo slug já existe
    if (updateData.slug && updateData.slug !== post.slug) {
      const existingPost = await Post.findOne({ where: { slug: updateData.slug } });
      if (existingPost) {
        return res.status(400).json({
          error: 'Slug já existe. Escolha um slug único.'
        });
      }
    }

    await post.update(updateData);

    // Buscar o post atualizado com as associações
    const updatedPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ]
    });

    res.json({
      message: 'Post atualizado com sucesso',
      post: updatedPost
    });
  } catch (error) {
    console.error('Erro ao atualizar post:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Eliminar post
 */
const deletePost = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({ where: { slug } });

    if (!post) {
      return res.status(404).json({
        error: 'Post não encontrado'
      });
    }

    // Verificar permissões
    if (req.user.role !== 'admin' && req.user.role !== 'editor' && post.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Permissão insuficiente'
      });
    }

    await post.destroy();

    res.json({
      message: 'Post eliminado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao eliminar post:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter categorias de posts
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Post.findAll({
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
 * Obter tags de posts
 */
const getTags = async (req, res) => {
  try {
    const posts = await Post.findAll({
      attributes: ['tags'],
      where: {
        tags: { [Op.ne]: null },
        isPublished: true
      },
      raw: true
    });

    const allTags = posts.reduce((acc, post) => {
      if (post.tags && Array.isArray(post.tags)) {
        acc.push(...post.tags);
      }
      return acc;
    }, []);

    const uniqueTags = [...new Set(allTags)];

    res.json({ tags: uniqueTags });
  } catch (error) {
    console.error('Erro ao obter tags:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getAllPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getCategories,
  getTags
};

