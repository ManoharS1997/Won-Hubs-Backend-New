const express = require("express");
const router = express.Router();

const zapiarControllers = require('../../controllers/connectionControllers/zapier-controllers');


router.post("/zapier/post",zapiarControllers.postToZapier);








module.exports = router;