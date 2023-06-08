const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');

// // Get items 
const itemController = require('../controllers/itemController');

// GET request to filter items 
router.get('/', itemController.getItems);

// POST request to add an item
router.post('/', upload.single('image'), itemController.addItem);

//Get item by id
router.get('/id/:id', itemController.getItemById);

//edit and delete
router.put('/:id', itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

module.exports = router;