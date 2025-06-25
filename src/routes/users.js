const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/authorization');
const { validate, schemas } = require('../middleware/validation');

// Rotas públicas
router.get('/:id', 
  validate(schemas.idParam, 'params'),
  userController.getUserById
);

// Rotas protegidas (apenas admin)
router.get('/', 
  authenticate,
  requireAdmin,
  validate(schemas.pagination, 'query'),
  userController.getAllUsers
);

router.post('/', 
  authenticate,
  requireAdmin,
  validate(schemas.userRegister),
  userController.createUser
);

router.put('/:id', 
  authenticate,
  validate(schemas.idParam, 'params'),
  validate(schemas.userUpdate),
  userController.updateUser
);

router.delete('/:id', 
  authenticate,
  requireAdmin,
  validate(schemas.idParam, 'params'),
  userController.deleteUser
);

router.get('/:id/stats', 
  authenticate,
  validate(schemas.idParam, 'params'),
  userController.getUserStats
);

module.exports = router;

