import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MongoDB Connection
const MONGO_URI = 'mongodb+srv://burnedwanderer:404051@smartdaycare.kzo4jta.mongodb.net/22299315?retryWrites=true&w=majority&appName=smartdaycare';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected Successfully to 22299315 database'))
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
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Import Routes
import activityRoutes from './routes/activities.js';
import notificationRoutes from './routes/notifications.js';
import chatRoutes from './routes/chats.js';

// Use Routes
app.use('/api/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chats', chatRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        message: 'Smart Daycare Backend is running',
        database: '22299315',
        modules: [
            'Module 3: Activity Management', 
            'Module 3: Notifications',
            'Module 3: Parent-Staff Chat'
        ],
        timestamp: new Date()
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('🔌 New socket connection:', socket.id);
    
    // User goes online
    socket.on('user_online', ({ userId, role }) => {
        socket.userId = userId;
        socket.userRole = role;
        
        // Join user to their personal room
        socket.join(`user_${userId}`);
        
        // Broadcast user online status
        socket.broadcast.emit('user_status', {
            userId,
            status: 'online'
        });
        
        console.log(`👤 User ${userId} (${role}) is online`);
    });
    
    // User joins a chat room
    socket.on('join_chat', (chatId) => {
        socket.join(`chat_${chatId}`);
        console.log(`Socket ${socket.id} joined chat: ${chatId}`);
    });
    
    // Send message
    socket.on('send_message', (messageData) => {
        const { chatId, senderId, content } = messageData;
        
        // Emit to all users in the chat room except sender
        socket.to(`chat_${chatId}`).emit('receive_message', messageData);
        
        // Also emit to sender for immediate UI update
        socket.emit('receive_message', messageData);
        
        console.log(`💬 Message in chat ${chatId} from ${senderId}: ${content.substring(0, 50)}...`);
    });
    
    // Typing indicator
    socket.on('typing', ({ chatId, userId, isTyping }) => {
        socket.to(`chat_${chatId}`).emit('user_typing', {
            userId,
            chatId,
            isTyping
        });
    });
    
    // Disconnect
    socket.on('disconnect', () => {
        if (socket.userId) {
            // Broadcast user offline status
            socket.broadcast.emit('user_status', {
                userId: socket.userId,
                status: 'offline'
            });
            
            console.log(`👤 User ${socket.userId} disconnected`);
        }
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

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`💬 Socket.io ready for real-time chat`);
    console.log(`📁 Database: 22299315`);
    console.log(`📁 Collections:`);
    console.log(`   • activities`);
    console.log(`   • notifications`);
    console.log(`   • chats`);
    console.log(`   • messages`);
    console.log(`📁 Modules loaded:`);
    console.log(`   • Module 3, Feature 1: Activity Management & Photos`);
    console.log(`   • Module 3, Feature 2: Parent Notifications`);
    console.log(`   • Module 3, Feature 3: Parent-Staff Chat (Real-time)`);
});