const express = require("express");
const router = express.Router();
const authorization = require("../../utils/auth/authorization");

const ticketControllers = require("../../controllers/TicketControllers");

// Create new ticket
router.post("/newTicket", authorization, ticketControllers.createTicket);

// Update ticket
router.put("/update/:ticketId", authorization, ticketControllers.updateTicket);

// Get ticket by ID
router.get("/:id", authorization, ticketControllers.getTicketById);

// Delete ticket
router.delete("/delete/:ticketId", authorization, ticketControllers.deleteTicket);

module.exports = router;
