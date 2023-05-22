const express = require('express');
const router = express.Router();

const { getItems, addItem } = require('../controllers/itemController');

// Get all items
router.get('/', getItems);
// Add an item
router.post('/add', addItem);

module.exports = router;