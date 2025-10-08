const express = require("express");
const router = express.Router();

const zendeskControllers = require('../../controllers/connectionControllers/zendesk-controllers');


router.post("/zendesk/get-all/tickets",zendeskControllers.getAllZendeskTickets);













module.exports = router;