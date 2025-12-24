import express from 'express';
import mongoose from 'mongoose';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

const router = express.Router();

// Create a new chat
router.post('/', async (req, res) => {
    try {
        const { participant1, participant2 } = req.body;
        
        // Check if chat already exists between these participants
        const existingChat = await Chat.findOne({
            $and: [
                { 'participants.id': participant1.id },
                { 'participants.id': participant2.id }
            ]
        });
        
        if (existingChat) {
            return res.json({
                success: true,
                data: { chat: existingChat },
                message: 'Chat already exists'
            });
        }
        
        const chat = new Chat({
            participants: [participant1, participant2],
            lastMessageTime: new Date(),
            unreadCount: 0
        });
        
        await chat.save();
        
        res.status(201).json({
            success: true,
            data: { chat },
            message: 'Chat created successfully'
        });
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create chat',
            error: error.message
        });
    }
});

// Get user's chats
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const chats = await Chat.find({
            'participants.id': userId
        })
        .sort({ lastMessageTime: -1 })
        .lean(); // Use lean for better performance
        
        // Format the response
        const formattedChats = chats.map(chat => ({
            _id: chat._id,
            participants: chat.participants,
            lastMessageTime: chat.lastMessageTime,
            lastMessage: chat.lastMessage || '',
            unreadCount: chat.unreadCount || 0,
            createdAt: chat.createdAt
        }));
        
        res.json({
            success: true,
            data: { chats: formattedChats },
            message: 'Chats retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch chats',
            error: error.message
        });
    }
});

// Get messages for a chat
router.get('/:chatId/messages', async (req, res) => {
    try {
        const { chatId } = req.params;
        const { limit = 100, skip = 0 } = req.query;
        
        // Validate chatId
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid chat ID'
            });
        }
        
        const messages = await Message.find({ chatId })
            .sort({ timestamp: 1 }) // Oldest first for chat view
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .lean();
        
        res.json({
            success: true,
            data: { messages },
            message: 'Messages retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages',
            error: error.message
        });
    }
});

// Save a message
router.post('/messages', async (req, res) => {
    try {
        const { chatId, senderId, senderRole, content, timestamp } = req.body;
        
        // Validate required fields
        if (!chatId || !senderId || !senderRole || !content) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Validate chatId
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid chat ID'
            });
        }
        
        const message = new Message({
            chatId,
            senderId,
            senderRole,
            content: content.trim(),
            timestamp: timestamp || new Date(),
            read: false
        });
        
        await message.save();
        
        // Update chat's last message time and increment unread count
        await Chat.findByIdAndUpdate(chatId, {
            lastMessageTime: new Date(),
            lastMessage: content.length > 100 ? content.substring(0, 100) + '...' : content,
            $inc: { unreadCount: 1 }
        });
        
        res.status(201).json({
            success: true,
            data: { message },
            message: 'Message saved successfully'
        });
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save message',
            error: error.message
        });
    }
});

// Mark messages as read
router.put('/:chatId/read', async (req, res) => {
    try {
        const { chatId } = req.params;
        const { userId } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid chat ID'
            });
        }
        
        // Mark all messages in chat as read for this user
        await Message.updateMany(
            { 
                chatId, 
                senderId: { $ne: userId } // Messages not sent by this user
            },
            { 
                $set: { read: true },
                $addToSet: { 
                    readBy: { 
                        userId, 
                        readAt: new Date() 
                    } 
                }
            }
        );
        
        // Reset unread count for this chat
        await Chat.findByIdAndUpdate(chatId, {
            unreadCount: 0
        });
        
        res.json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read',
            error: error.message
        });
    }
});

// Delete a chat
router.delete('/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid chat ID'
            });
        }
        
        // Delete all messages in the chat
        await Message.deleteMany({ chatId });
        
        // Delete the chat
        await Chat.findByIdAndDelete(chatId);
        
        res.json({
            success: true,
            message: 'Chat deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete chat',
            error: error.message
        });
    }
});

// Get chat participants
router.get('/:chatId/participants', async (req, res) => {
    try {
        const { chatId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid chat ID'
            });
        }
        
        const chat = await Chat.findById(chatId);
        
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }
        
        res.json({
            success: true,
            data: { participants: chat.participants },
            message: 'Participants retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching participants:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch participants',
            error: error.message
        });
    }
});

// Get chat statistics
router.get('/user/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const totalChats = await Chat.countDocuments({
            'participants.id': userId
        });
        
        const totalUnread = await Chat.aggregate([
            { $match: { 'participants.id': userId } },
            { $group: { _id: null, total: { $sum: '$unreadCount' } } }
        ]);
        
        const unreadCount = totalUnread.length > 0 ? totalUnread[0].total : 0;
        
        res.json({
            success: true,
            data: {
                totalChats,
                unreadCount
            },
            message: 'Chat statistics retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching chat stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch chat statistics',
            error: error.message
        });
    }
});

export default router;