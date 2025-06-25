const express = require('express');
const router = express.Router();

const downloadController = require('../controllers/downloadController');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const { requireEditor } = require('../middleware/authorization');
const { validate, schemas } = require('../middleware/validation');
const { uploadSingle } = require('../middleware/upload');

// Rotas públicas
router.get('/', 
  optionalAuthenticate,
  validate(schemas.pagination, 'query'),
  downloadController.getAllDownloads
);

router.get('/categories', 
  downloadController.getCategories
);

router.get('/tags', 
  downloadController.getTags
);

router.get('/:slug', 
  optionalAuthenticate,
  validate(schemas.slugParam, 'params'),
  downloadController.getDownloadBySlug
);

router.get('/:slug/download', 
  optionalAuthenticate,
  validate(schemas.slugParam, 'params'),
  downloadController.downloadFile
);

// Rotas protegidas (requerem autenticação e permissões)
router.post('/', 
  authenticate,
  requireEditor,
  uploadSingle('file'),
  validate(schemas.downloadCreate),
  downloadController.createDownload
);

router.put('/:slug', 
  authenticate,
  validate(schemas.slugParam, 'params'),
  uploadSingle('file'), // Ficheiro é opcional para update
  validate(schemas.downloadCreate), // Usar o mesmo schema para update
  downloadController.updateDownload
);

router.delete('/:slug', 
  authenticate,
  validate(schemas.slugParam, 'params'),
  downloadController.deleteDownload
);

module.exports = router;

