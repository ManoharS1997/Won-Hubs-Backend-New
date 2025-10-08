
const express = require("express");
const router = express.Router();

const soapControllers = require('../../controllers/soapControllers/test-soap-controllers');

router.post("/test/soap", soapControllers.testSoapConnection);
router.post("/test/soap-post-method", soapControllers.testPostSoapApi);
router.post("/test/any-soap-method", soapControllers.testAnySoapApi);
router.post("/test/handle-soap-operation", soapControllers.handleSoapOperation);

module.exports = router; 