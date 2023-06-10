// routes.js

const express = require('express');
const transactionController = require('../controllers/transactionController');

const router = express.Router();

// Transaction routes
router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
router.get('/all', transactionController.getAllTransactions);
router.get('/:id', transactionController.getTransactionById);
router.put('/:id', transactionController.updateTransactionById);
router.delete('/:id', transactionController.deleteTransactionById);

module.exports = router;
