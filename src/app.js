// src/app.js

const express = require('express');
const loginRoutes = require('./routes/loginRoutes');
const registerRoutes = require('./routes/registerRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/login', loginRoutes);
app.use('/register', registerRoutes);

app.listen(port, () => console.log(`Server is running on port ${port}`));
