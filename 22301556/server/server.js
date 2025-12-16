const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const billingRoutes = require('./routes/billingRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Simple mock admin middleware (you can replace with real auth later)
const mockAdminMiddleware = (req, res, next) => {
  // In real app, you would check JWT / role here
  req.user = { id: 'mock-admin-id', role: 'admin' };
  next();
};

// Routes
app.use('/api/billing', mockAdminMiddleware, billingRoutes);
app.use('/api/analytics', mockAdminMiddleware, analyticsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Smart Daycare API (Module 4) is running' });
});

// Connect to DB & start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB connection error:', err.message);
  });
