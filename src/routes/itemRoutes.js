const express = require('express');
const router = express.Router();

// const { getItems, addItem, getItemsByCategory, getItemsByPriceRange, getItemsByCategoryAndPriceRange } = require('../controllers/itemController');

// // Get all items
// router.get('/', getItems);
// // Add an item
// router.post('/add', addItem);
// // GET /items/:category
// router.get('/:category', getItemsByCategory);
// // Get items by price range
// router.get('/price', getItemsByPriceRange);

// // Get items by category and price range
// router.get('/filter', getItemsByCategoryAndPriceRange);
const itemController = require('../controllers/itemController');

// GET request to filter items by category and price range
router.get('/', itemController.getItems);

// POST request to add an item
router.post('/', itemController.addItem);

module.exports = router;