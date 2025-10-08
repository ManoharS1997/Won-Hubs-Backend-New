// const {db}=require('../config/database');
const { db } = require("../config/DB-connection");

// Create a new ticket
const createTicket = async (req, res) => {
  const ticketData = req.body;

  const insertQuery = `
    INSERT INTO ticket (
      name, on_behalf_of, category, sub_category, service,
      status, approval_state, short_description, description,
      private_comments, public_comments, active, history,
      priority, requested_email, department, state, assigned_member,
      approved_by, requested_by, task_type, attachments, price_per_unit,
      quantity, channel
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    ticketData.name || null,
    ticketData.on_behalf_of || null,
    ticketData.category || null,
    ticketData.sub_category || null,
    ticketData.service || null,
    ticketData.status || null,
    ticketData.approval_state || null,
    ticketData.short_description || null,
    ticketData.description || null,
    ticketData.private_comments || null,
    ticketData.public_comments || null,
    ticketData.active || null,
    ticketData.history || null,
    ticketData.priority || null,
    ticketData.requested_email || null,
    ticketData.department || null,
    ticketData.state || null,
    ticketData.assigned_member || null,
    ticketData.approved_by || null,
    ticketData.requested_by || null,
    ticketData.task_type || null,
    ticketData.attachments || null,
    ticketData.price_per_unit || null,
    ticketData.quantity || null,
    ticketData.channel || null,
  ];

  try {
    const [result] = await db.execute(insertQuery, values);
    res.json({ success: true, ticketId: result.insertId });
  } catch (error) {
    console.error("Error inserting ticket:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update a ticket
const updateTicket = async (req, res) => {
  const updatedTicketData = req.body;
  const ticketId = req.params.ticketId;

  const updateQuery = `
    UPDATE ticket SET 
      ticket_no = ?, 
      service = ?, 
      status = ?, 
      approval_state = ?, 
      short_description = ?, 
      description = ?, 
      private_comments = ?, 
      public_comments = ?, 
      active = ?, 
      history = ?
    WHERE ticket_id = ?
  `;

  const values = [
    updatedTicketData.ticket_no || null,
    updatedTicketData.service || null,
    updatedTicketData.status || null,
    updatedTicketData.approval_state || null,
    updatedTicketData.short_description || null,
    updatedTicketData.description || null,
    updatedTicketData.private_comments || null,
    updatedTicketData.public_comments || null,
    updatedTicketData.active || null,
    updatedTicketData.history || null,
    ticketId,
  ];

  try {
    const [result] = await db.execute(updateQuery, values);
    res.json({ success: true, ticketId });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get ticket by ID
const getTicketById = async (req, res) => {
  const ticketId = req.params.id;
  const query = "SELECT * FROM ticket WHERE ticket_id = ?";

  try {
    const [results] = await db.execute(query, [ticketId]);
    if (results.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    res.json({ ticket: results[0] });
  } catch (error) {
    console.error("Error fetching ticket details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a ticket
const deleteTicket = async (req, res) => {
  const ticketId = req.params.ticketId;
  const deleteQuery = "DELETE FROM ticket WHERE ticket_id = ?";

  try {
    const [result] = await db.execute(deleteQuery, [ticketId]);
    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Ticket deleted successfully" });
    } else {
      res.status(404).json({ error: "Ticket not found" });
    }
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createTicket,
  updateTicket,
  getTicketById,
  deleteTicket,
};
