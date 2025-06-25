const Joi = require('joi');

/**
 * Middleware para validação de dados usando Joi
 * @param {Object} schema - Schema de validação Joi
 * @param {String} source - Fonte dos dados ('body', 'query', 'params')
 * @returns {Function} Middleware de validação
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    
    const { error, value } = schema.validate(data, {
      abortEarly: false, // Retornar todos os erros
      stripUnknown: true // Remover campos não definidos no schema
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors
      });
    }

    // Substituir os dados originais pelos dados validados
    req[source] = value;
    next();
  };
};

// Schemas de validação comuns
const schemas = {
  // Validação para registo de utilizador
  userRegister: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    role: Joi.string().valid('admin', 'editor', 'viewer').default('viewer')
  }),

  // Validação para login
  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Validação para atualização de utilizador
  userUpdate: Joi.object({
    name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    bio: Joi.string().max(1000),
    avatar: Joi.string().uri()
  }),

  // Validação para mudança de password
  passwordChange: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(100).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  }),

  // Validação para posts
  postCreate: Joi.object({
    title: Joi.string().min(1).max(255).required(),
    slug: Joi.string().min(1).max(255).required(),
    excerpt: Joi.string().max(500),
    fullContent: Joi.string().required(),
    author: Joi.string().required(),
    publishDate: Joi.date().iso().required(),
    category: Joi.string().max(100),
    tags: Joi.array().items(Joi.string()),
    imageUrl: Joi.string().uri(),
    isPublished: Joi.boolean().default(false)
  }),

  postUpdate: Joi.object({
    title: Joi.string().min(1).max(255),
    slug: Joi.string().min(1).max(255),
    excerpt: Joi.string().max(500),
    fullContent: Joi.string(),
    author: Joi.string(),
    publishDate: Joi.date().iso(),
    category: Joi.string().max(100),
    tags: Joi.array().items(Joi.string()),
    imageUrl: Joi.string().uri(),
    isPublished: Joi.boolean()
  }),

  // Validação para projetos
  projectCreate: Joi.object({
    title: Joi.string().min(1).max(255).required(),
    slug: Joi.string().min(1).max(255).required(),
    description: Joi.string().required(),
    fullDescription: Joi.string(),
    imageUrl: Joi.string().uri(),
    gallery: Joi.array().items(Joi.string().uri()),
    technologies: Joi.array().items(Joi.string()),
    category: Joi.string().max(100),
    status: Joi.string().valid('planning', 'in_progress', 'completed', 'on_hold').default('planning'),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    projectUrl: Joi.string().uri(),
    githubUrl: Joi.string().uri(),
    demoUrl: Joi.string().uri(),
    client: Joi.string().max(255),
    budget: Joi.number().positive(),
    isPublished: Joi.boolean().default(false),
    isFeatured: Joi.boolean().default(false)
  }),

  // Validação para downloads
  downloadCreate: Joi.object({
    title: Joi.string().min(1).max(255).required(),
    slug: Joi.string().min(1).max(255).required(),
    description: Joi.string().required(),
    category: Joi.string().max(100),
    tags: Joi.array().items(Joi.string()),
    fileName: Joi.string().required(),
    fileType: Joi.string(),
    thumbnailUrl: Joi.string().uri(),
    version: Joi.string().max(50),
    author: Joi.string().required(),
    license: Joi.string().max(100),
    requirements: Joi.string(),
    instructions: Joi.string(),
    isPublished: Joi.boolean().default(false),
    isFeatured: Joi.boolean().default(false),
    requiresAuth: Joi.boolean().default(false),
    price: Joi.number().min(0).default(0),
    publishDate: Joi.date().iso(),
    expiryDate: Joi.date().iso()
  }),

  // Validação para contacto
  contactCreate: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().max(20),
    company: Joi.string().max(100),
    subject: Joi.string().min(1).max(255).required(),
    message: Joi.string().min(10).max(2000).required(),
    category: Joi.string().valid('general', 'project', 'collaboration', 'support', 'other').default('general')
  }),

  // Validação para parâmetros de ID
  idParam: Joi.object({
    id: Joi.number().integer().positive().required()
  }),

  // Validação para parâmetros de slug
  slugParam: Joi.object({
    slug: Joi.string().required()
  }),

  // Validação para query de paginação
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().default('createdAt'),
    order: Joi.string().valid('ASC', 'DESC').default('DESC')
  })
};

module.exports = {
  validate,
  schemas
};

