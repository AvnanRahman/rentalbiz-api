// src/app.js

const express = require('express');
const loginRoutes = require('./routes/loginRoutes');
const registerRoutes = require('./routes/registerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const itemRoutes = require('./routes/itemRoutes');

require('dotenv').config();

const app = express();
const port = process.env._PORT || 8080;

app.use(express.json());

// Routes
app.use('/login', loginRoutes);
app.use('/register', registerRoutes);
app.use('/admin', adminRoutes);
app.use('/items', itemRoutes);

app.listen(port, () => console.log(`Server is running on port ${port}`));
