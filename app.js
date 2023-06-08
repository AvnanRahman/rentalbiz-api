// src/app.js

const express = require('express');
const isAuthenticated = require('./src/middleware/authMiddleware');
const upload = require('./src/middleware/multer');
const loginRoutes = require('./src/routes/loginRoutes');
const registerRoutes = require('./src/routes/registerRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const itemRoutes = require('./src/routes/itemRoutes');
const userRoutes =  require('./src/routes/userRoutes');
const uploadRouters = require('./src/routes/uploadRoutes');

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
app.use('/admin', isAuthenticated, adminRoutes);
app.use('/items', isAuthenticated, itemRoutes);
app.use('/user', isAuthenticated, userRoutes);
app.use('/upload', upload.single('image'), uploadRouters);

app.listen(port, () => console.log(`Server is running on port ${port}`));
