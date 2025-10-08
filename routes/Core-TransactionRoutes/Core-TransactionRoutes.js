const express = require("express");
const router = express.Router();
const coreTransactionsController = require("../../controllers/Core-TransactionControllers/Core-TransactionControllers");

// Create new transaction
router.post("/core-transaction/newTransaction", coreTransactionsController.createTransaction);

// Update transaction by ID
router.put("/core-transactions/update/:transactionId", coreTransactionsController.updateTransaction);

// Get transaction by ID
router.get("/core-transactions/:transactionId", coreTransactionsController.getTransactionById);

// Delete transaction by ID
router.delete("/core-transactions/delete/:transactionId", coreTransactionsController.deleteTransaction);

module.exports = router;
