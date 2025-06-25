const { Download, User } = require('../models');
const { Op } = require('sequelize');
const { deleteFile, getFileInfo } = require('../middleware/upload');
const path = require('path');

/**
 * Obter todos os downloads com paginação e filtros
 */
const getAllDownloads = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt', 
      order = 'DESC',
      category,
      fileType,
      published,
      featured,
      free,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Construir condições de filtro
    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (fileType) {
      where.fileType = { [Op.iLike]: `%${fileType}%` };
    }
    
    if (published !== undefined) {
      where.isPublished = published === 'true';
    }
    
    if (featured !== undefined) {
      where.isFeatured = featured === 'true';
    }
    
    if (free !== undefined) {
      if (free === 'true') {
        where.price = 0;
      } else {
        where.price = { [Op.gt]: 0 };
      }
    }
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { fileName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Se não for admin/editor, mostrar apenas downloads publicados
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      where.isPublished = true;
    }

    const { count, rows: downloads } = await Download.findAndCountAll({
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
      downloads,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao obter downloads:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter download por slug
 */
const getDownloadBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const download = await Download.findOne({
      where: { slug },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ]
    });

    if (!download) {
      return res.status(404).json({
        error: 'Download não encontrado'
      });
    }

    // Se não for admin/editor e o download não estiver publicado, negar acesso
    if (!download.isPublished && (!req.user || !['admin', 'editor'].includes(req.user.role))) {
      return res.status(404).json({
        error: 'Download não encontrado'
      });
    }

    // Verificar se requer autenticação
    if (download.requiresAuth && !req.user) {
      return res.status(401).json({
        error: 'Autenticação necessária para aceder a este download'
      });
    }

    res.json({ download });
  } catch (error) {
    console.error('Erro ao obter download:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Criar novo download
 */
const createDownload = async (req, res) => {
  try {
    const downloadData = {
      ...req.body,
      userId: req.user.id
    };

    // Verificar se foi enviado um ficheiro
    if (req.file) {
      const fileInfo = getFileInfo(req.file);
      downloadData.fileUrl = fileInfo.url;
      downloadData.fileName = fileInfo.originalName;
      downloadData.fileSize = fileInfo.size;
      downloadData.fileType = fileInfo.mimetype;
    } else {
      return res.status(400).json({
        error: 'Ficheiro é obrigatório'
      });
    }

    // Verificar se o slug já existe
    const existingDownload = await Download.findOne({ where: { slug: downloadData.slug } });
    if (existingDownload) {
      // Eliminar ficheiro enviado se slug já existe
      if (req.file) {
        deleteFile(req.file.path);
      }
      return res.status(400).json({
        error: 'Slug já existe. Escolha um slug único.'
      });
    }

    const download = await Download.create(downloadData);

    // Buscar o download criado com as associações
    const createdDownload = await Download.findByPk(download.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ]
    });

    res.status(201).json({
      message: 'Download criado com sucesso',
      download: createdDownload
    });
  } catch (error) {
    // Eliminar ficheiro enviado em caso de erro
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    console.error('Erro ao criar download:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualizar download
 */
const updateDownload = async (req, res) => {
  try {
    const { slug } = req.params;
    const updateData = req.body;

    const download = await Download.findOne({ where: { slug } });

    if (!download) {
      // Eliminar ficheiro enviado se download não existe
      if (req.file) {
        deleteFile(req.file.path);
      }
      return res.status(404).json({
        error: 'Download não encontrado'
      });
    }

    // Verificar permissões
    if (req.user.role !== 'admin' && req.user.role !== 'editor' && download.userId !== req.user.id) {
      // Eliminar ficheiro enviado se não tem permissão
      if (req.file) {
        deleteFile(req.file.path);
      }
      return res.status(403).json({
        error: 'Permissão insuficiente'
      });
    }

    // Se o slug está sendo alterado, verificar se o novo slug já existe
    if (updateData.slug && updateData.slug !== download.slug) {
      const existingDownload = await Download.findOne({ where: { slug: updateData.slug } });
      if (existingDownload) {
        // Eliminar ficheiro enviado se slug já existe
        if (req.file) {
          deleteFile(req.file.path);
        }
        return res.status(400).json({
          error: 'Slug já existe. Escolha um slug único.'
        });
      }
    }

    // Se foi enviado um novo ficheiro, atualizar informações do ficheiro
    if (req.file) {
      // Eliminar ficheiro antigo
      const oldFilePath = path.join(process.env.UPLOAD_PATH || './uploads', path.basename(download.fileUrl));
      deleteFile(oldFilePath);

      const fileInfo = getFileInfo(req.file);
      updateData.fileUrl = fileInfo.url;
      updateData.fileName = fileInfo.originalName;
      updateData.fileSize = fileInfo.size;
      updateData.fileType = fileInfo.mimetype;
    }

    await download.update(updateData);

    // Buscar o download atualizado com as associações
    const updatedDownload = await Download.findByPk(download.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ]
    });

    res.json({
      message: 'Download atualizado com sucesso',
      download: updatedDownload
    });
  } catch (error) {
    // Eliminar ficheiro enviado em caso de erro
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    console.error('Erro ao atualizar download:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Eliminar download
 */
const deleteDownload = async (req, res) => {
  try {
    const { slug } = req.params;

    const download = await Download.findOne({ where: { slug } });

    if (!download) {
      return res.status(404).json({
        error: 'Download não encontrado'
      });
    }

    // Verificar permissões
    if (req.user.role !== 'admin' && req.user.role !== 'editor' && download.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Permissão insuficiente'
      });
    }

    // Eliminar ficheiro do sistema de ficheiros
    const filePath = path.join(process.env.UPLOAD_PATH || './uploads', path.basename(download.fileUrl));
    deleteFile(filePath);

    await download.destroy();

    res.json({
      message: 'Download eliminado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao eliminar download:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Fazer download do ficheiro
 */
const downloadFile = async (req, res) => {
  try {
    const { slug } = req.params;

    const download = await Download.findOne({ where: { slug } });

    if (!download) {
      return res.status(404).json({
        error: 'Download não encontrado'
      });
    }

    // Verificar se está publicado
    if (!download.isPublished && (!req.user || !['admin', 'editor'].includes(req.user.role))) {
      return res.status(404).json({
        error: 'Download não encontrado'
      });
    }

    // Verificar se requer autenticação
    if (download.requiresAuth && !req.user) {
      return res.status(401).json({
        error: 'Autenticação necessária para fazer download deste ficheiro'
      });
    }

    // Verificar se o ficheiro existe
    const filePath = path.join(process.env.UPLOAD_PATH || './uploads', path.basename(download.fileUrl));
    
    if (!require('fs').existsSync(filePath)) {
      return res.status(404).json({
        error: 'Ficheiro não encontrado no servidor'
      });
    }

    // Incrementar contador de downloads
    await download.increment('downloadCount');

    // Enviar ficheiro
    res.download(filePath, download.fileName, (err) => {
      if (err) {
        console.error('Erro ao enviar ficheiro:', err);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Erro ao fazer download do ficheiro'
          });
        }
      }
    });
  } catch (error) {
    console.error('Erro no download:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter categorias de downloads
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Download.findAll({
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
 * Obter tags de downloads
 */
const getTags = async (req, res) => {
  try {
    const downloads = await Download.findAll({
      attributes: ['tags'],
      where: {
        tags: { [Op.ne]: null },
        isPublished: true
      },
      raw: true
    });

    const allTags = downloads.reduce((acc, download) => {
      if (download.tags && Array.isArray(download.tags)) {
        acc.push(...download.tags);
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
  getAllDownloads,
  getDownloadBySlug,
  createDownload,
  updateDownload,
  deleteDownload,
  downloadFile,
  getCategories,
  getTags
};

