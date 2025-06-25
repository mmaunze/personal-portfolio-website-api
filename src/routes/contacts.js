const express = require('express');
const router = express.Router();

const contactController = require('../controllers/contactController');
const { authenticate } = require('../middleware/auth');
const { requireEditor, requireAdmin } = require('../middleware/authorization');
const { validate, schemas } = require('../middleware/validation');

// Rotas públicas
router.post('/', 
  validate(schemas.contactCreate),
  contactController.createContact
);

// Rotas protegidas (apenas admin/editor)
router.get('/', 
  authenticate,
  requireEditor,
  validate(schemas.pagination, 'query'),
  contactController.getAllContacts
);

router.get('/stats', 
  authenticate,
  requireEditor,
  contactController.getContactStats
);

router.get('/:id', 
  authenticate,
  requireEditor,
  validate(schemas.idParam, 'params'),
  contactController.getContactById
);

router.put('/:id/status', 
  authenticate,
  requireEditor,
  validate(schemas.idParam, 'params'),
  contactController.updateContactStatus
);

router.put('/:id/spam', 
  authenticate,
  requireEditor,
  validate(schemas.idParam, 'params'),
  contactController.markAsSpam
);

router.delete('/:id', 
  authenticate,
  requireAdmin,
  validate(schemas.idParam, 'params'),
  contactController.deleteContact
);

module.exports = router;

