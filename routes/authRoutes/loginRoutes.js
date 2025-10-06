
const express = require("express");
const router = express.Router();

const loginController = require("../../controllers/authControllers/loginConroller.js");

router.post('/', loginController.login)
router.post('/find/username', loginController.findUsername)
router.post('/verify/password-change', loginController.checkPasswordAndSendEmailOTP)
router.post('/verify/password-update-otp', loginController.verifyEmailOTP)
router.put('/update/login-count', loginController.updateLoginCount)

module.exports = router