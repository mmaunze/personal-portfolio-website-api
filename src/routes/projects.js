const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectController');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const { requireEditor } = require('../middleware/authorization');
const { validate, schemas } = require('../middleware/validation');

// Rotas públicas
router.get('/', 
  optionalAuthenticate,
  validate(schemas.pagination, 'query'),
  projectController.getAllProjects
);

router.get('/categories', 
  projectController.getCategories
);

router.get('/technologies', 
  projectController.getTechnologies
);

router.get('/:slug', 
  optionalAuthenticate,
  validate(schemas.slugParam, 'params'),
  projectController.getProjectBySlug
);

// Rotas protegidas (requerem autenticação e permissões)
router.post('/', 
  authenticate,
  requireEditor,
  validate(schemas.projectCreate),
  projectController.createProject
);

router.put('/:slug', 
  authenticate,
  validate(schemas.slugParam, 'params'),
  validate(schemas.projectCreate), // Usar o mesmo schema para update
  projectController.updateProject
);

router.delete('/:slug', 
  authenticate,
  validate(schemas.slugParam, 'params'),
  projectController.deleteProject
);

module.exports = router;

