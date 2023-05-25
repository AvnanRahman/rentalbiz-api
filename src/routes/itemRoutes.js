const express = require('express');
const router = express.Router();

// // Get items by category and price range
// router.get('/filter', getItemsByCategoryAndPriceRange);
const itemController = require('../controllers/itemController');

// GET request to filter items by category and price range
router.get('/', itemController.getItems);

// POST request to add an item
router.post('/', itemController.addItem);

module.exports = router;