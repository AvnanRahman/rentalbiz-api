// adminRoutes.js

const express = require('express');
const { addAdmin, listUsers } = require('../controllers/adminController');

const router = express.Router();

router.post('/add-admin', addAdmin);
router.get('/users', listUsers);

module.exports = router;
