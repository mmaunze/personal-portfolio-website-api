const { Contact } = require('../models');
const { Op } = require('sequelize');

/**
 * Criar nova mensagem de contacto
 */
const createContact = async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referer')
    };

    const contact = await Contact.create(contactData);

    res.status(201).json({
      message: 'Mensagem enviada com sucesso. Entraremos em contacto em breve.',
      contact: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        category: contact.category,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Erro ao criar contacto:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter todas as mensagens de contacto (apenas admin/editor)
 */
const getAllContacts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt', 
      order = 'DESC',
      status,
      category,
      priority,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Construir condições de filtro
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { subject: { [Op.iLike]: `%${search}%` } },
        { message: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: contacts } = await Contact.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ['priority', 'DESC'],
        [sort, order.toUpperCase()]
      ]
    });

    res.json({
      contacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao obter contactos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter contacto por ID (apenas admin/editor)
 */
const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByPk(id);

    if (!contact) {
      return res.status(404).json({
        error: 'Contacto não encontrado'
      });
    }

    // Marcar como lido se ainda não foi lido
    if (contact.status === 'new') {
      await contact.update({ 
        status: 'read',
        readAt: new Date()
      });
    }

    res.json({ contact });
  } catch (error) {
    console.error('Erro ao obter contacto:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualizar status do contacto (apenas admin/editor)
 */
const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, notes } = req.body;

    const contact = await Contact.findByPk(id);

    if (!contact) {
      return res.status(404).json({
        error: 'Contacto não encontrado'
      });
    }

    const updateData = {};
    
    if (status) {
      updateData.status = status;
      
      if (status === 'read' && !contact.readAt) {
        updateData.readAt = new Date();
      }
      
      if (status === 'replied' && !contact.repliedAt) {
        updateData.repliedAt = new Date();
      }
    }
    
    if (priority) {
      updateData.priority = priority;
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    await contact.update(updateData);

    res.json({
      message: 'Contacto atualizado com sucesso',
      contact
    });
  } catch (error) {
    console.error('Erro ao atualizar contacto:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Marcar contacto como spam (apenas admin/editor)
 */
const markAsSpam = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByPk(id);

    if (!contact) {
      return res.status(404).json({
        error: 'Contacto não encontrado'
      });
    }

    await contact.update({ 
      isSpam: true,
      status: 'closed'
    });

    res.json({
      message: 'Contacto marcado como spam'
    });
  } catch (error) {
    console.error('Erro ao marcar como spam:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Eliminar contacto (apenas admin)
 */
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByPk(id);

    if (!contact) {
      return res.status(404).json({
        error: 'Contacto não encontrado'
      });
    }

    await contact.destroy();

    res.json({
      message: 'Contacto eliminado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao eliminar contacto:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter estatísticas de contactos (apenas admin/editor)
 */
const getContactStats = async (req, res) => {
  try {
    const [
      totalContacts,
      newContacts,
      readContacts,
      repliedContacts,
      closedContacts,
      spamContacts
    ] = await Promise.all([
      Contact.count(),
      Contact.count({ where: { status: 'new' } }),
      Contact.count({ where: { status: 'read' } }),
      Contact.count({ where: { status: 'replied' } }),
      Contact.count({ where: { status: 'closed' } }),
      Contact.count({ where: { isSpam: true } })
    ]);

    res.json({
      stats: {
        total: totalContacts,
        new: newContacts,
        read: readContacts,
        replied: repliedContacts,
        closed: closedContacts,
        spam: spamContacts
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
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  markAsSpam,
  deleteContact,
  getContactStats
};

