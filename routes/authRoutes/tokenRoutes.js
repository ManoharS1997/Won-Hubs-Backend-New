

const express = require("express");
const router = express.Router();

const tokenControllers = require('../../controllers/authControllers/tokenController')
const validationControllers = require('../../utils/auth/validate')


router.get('/validate', validationControllers.validate)

router.post('/logout', tokenControllers.logout)
router.post('/refresh-token', tokenControllers.refreshToken)

module.exports = router 