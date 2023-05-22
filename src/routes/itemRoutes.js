const express = require('express');
const router = express.Router();

const { getItems, addItem, getItemsByCategory } = require('../controllers/itemController');

// Get all items
router.get('/', getItems);
// Add an item
router.post('/add', addItem);
// GET /items/:category
router.get('/:category', getItemsByCategory);

module.exports = router;