const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Rotas públicas (sem autenticação)
router.post('/register', 
  validate(schemas.userRegister),
  authController.register
);

router.post('/login', 
  validate(schemas.userLogin),
  authController.login
);

router.post('/refresh-token', 
  authController.refreshToken
);

// Rotas protegidas (requerem autenticação)
router.get('/profile', 
  authenticate,
  authController.getProfile
);

router.put('/profile', 
  authenticate,
  validate(schemas.userUpdate),
  authController.updateProfile
);

router.put('/change-password', 
  authenticate,
  validate(schemas.passwordChange),
  authController.changePassword
);

router.post('/logout', 
  authenticate,
  authController.logout
);

module.exports = router;

