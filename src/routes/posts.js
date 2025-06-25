const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const { requireEditor } = require('../middleware/authorization');
const { validate, schemas } = require('../middleware/validation');

// Rotas públicas
router.get('/', 
  optionalAuthenticate,
  validate(schemas.pagination, 'query'),
  postController.getAllPosts
);

router.get('/categories', 
  postController.getCategories
);

router.get('/tags', 
  postController.getTags
);

router.get('/:slug', 
  optionalAuthenticate,
  validate(schemas.slugParam, 'params'),
  postController.getPostBySlug
);

// Rotas protegidas (requerem autenticação e permissões)
router.post('/', 
  authenticate,
  requireEditor,
  validate(schemas.postCreate),
  postController.createPost
);

router.put('/:slug', 
  authenticate,
  validate(schemas.slugParam, 'params'),
  validate(schemas.postUpdate),
  postController.updatePost
);

router.delete('/:slug', 
  authenticate,
  validate(schemas.slugParam, 'params'),
  postController.deletePost
);

module.exports = router;

