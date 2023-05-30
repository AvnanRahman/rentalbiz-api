// src/app.js

const express = require('express');
const isAuthenticated = require('./src/controllers/authMiddleware');
const loginRoutes = require('./src/routes/loginRoutes');
const registerRoutes = require('./src/routes/registerRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const itemRoutes = require('./src/routes/itemRoutes');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the RentalBiz API');
  });
// Routes
app.use('/login', loginRoutes);
app.use('/register', registerRoutes);
app.use('/admin', adminRoutes);
app.use('/items', isAuthenticated, itemRoutes);

app.listen(port, () => console.log(`Server is running on port ${port}`));
