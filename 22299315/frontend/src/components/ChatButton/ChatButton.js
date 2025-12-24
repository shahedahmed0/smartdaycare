import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ChatButton.css';

const ChatButton = ({ userId, userRole = 'parent' }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        fetchUnreadCount();
        
        // Poll for new messages every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        
        return () => clearInterval(interval);
    }, [userId]);

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get(`http://localhost:5560/api/chats/user/${userId}`);
            
            if (response.data.success) {
                const totalUnread = response.data.data.chats.reduce((sum, chat) => 
                    sum + (chat.unreadCount || 0), 0
                );
                setUnreadCount(totalUnread);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    return (
        <Link to="/chat" className="chat-button-link">
            <div className="chat-button-container">
                <div className="chat-button">
                    <span className="chat-icon">💬</span>
                    {unreadCount > 0 && (
                        <span className="chat-badge">{unreadCount}</span>
                    )}
                    {isOnline && (
                        <span className="online-indicator"></span>
                    )}
                </div>
                <div className="chat-tooltip">
                    Chat with {userRole === 'parent' ? 'Staff' : 'Parents'}
                    {unreadCount > 0 && (
                        <span className="tooltip-count">({unreadCount} new)</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ChatButton;