const express = require('express');


const router = express.Router();
const{yahooAuth,yahooCallback}=require('../../controllers/GoogleAuthControllers/GoogleAuthControllers.js')

router.get('/yahoo',yahooAuth);
router.get('/yahoo/callback',yahooCallback);``




module.exports = router;
