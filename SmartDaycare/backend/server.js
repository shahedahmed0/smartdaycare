// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGO_URI = 'mongodb+srv://burnedwanderer:404051@smartdaycare.kzo4jta.mongodb.net/?appName=SmartDaycare';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
});

// Create uploads directory
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
    console.log('📁 Created uploads directory');
}

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes for Modules 2 & 3
const activityRoutes = require('./routes/activities');
const staffRoutes = require('./routes/staff');

// Use Routes
app.use('/api/activities', activityRoutes);  // Module 3, Feature 1
app.use('/api/staff', staffRoutes);          // Module 2, Feature 1

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'Smart Daycare Backend is running',
        modules: ['Module 2: Staff Management', 'Module 3: Activity Management'],
        timestamp: new Date()
    });
});

// Error Handling
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const PORT = process.env.PORT || 5560;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Modules loaded:`);
    console.log(`   • Module 2, Feature 1: Staff Management`);
    console.log(`   • Module 3, Feature 1: Activity Management & Photos`);
});
