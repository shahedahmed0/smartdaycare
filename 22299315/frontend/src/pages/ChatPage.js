import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import './ChatPage.css';

const ChatPage = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeChats, setActiveChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [userRole, setUserRole] = useState('parent');
    const [userId, setUserId] = useState('PARENT001');
    const [loading, setLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Initialize socket connection
    useEffect(() => {
        socketRef.current = io('http://localhost:5560');
        
        // Listen for incoming messages
        socketRef.current.on('receive_message', (message) => {
            setMessages(prev => [...prev, message]);
            
            // Update active chats list with new message
            setActiveChats(prev => prev.map(chat => {
                if (chat._id === message.chatId) {
                    return {
                        ...chat,
                        lastMessage: message.content,
                        lastMessageTime: message.timestamp,
                        unreadCount: chat._id === selectedChat?._id ? 0 : chat.unreadCount + 1
                    };
                }
                return chat;
            }));
        });

        // Listen for user status updates
        socketRef.current.on('user_status', ({ userId, status }) => {
            setOnlineUsers(prev => {
                if (status === 'online') {
                    return [...new Set([...prev, userId])];
                } else {
                    return prev.filter(id => id !== userId);
                }
            });
        });

        // Listen for typing indicators
        socketRef.current.on('user_typing', ({ userId, chatId, isTyping }) => {
            if (chatId === selectedChat?._id) {
                setTypingUsers(prev => ({
                    ...prev,
                    [chatId]: isTyping ? userId : null
                }));
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    // Fetch user chats and messages
    useEffect(() => {
        fetchUserChats();
        
        // Check user role from localStorage
        const role = localStorage.getItem('userRole') || 'parent';
        const id = localStorage.getItem('userId') || 'PARENT001';
        setUserRole(role);
        setUserId(id);
        
        // Emit user online status
        if (socketRef.current) {
            socketRef.current.emit('user_online', { userId: id, role });
        }
    }, []);

    // Fetch messages when chat is selected
    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat._id);
            
            // Join chat room
            if (socketRef.current) {
                socketRef.current.emit('join_chat', selectedChat._id);
                
                // Mark messages as read
                markMessagesAsRead(selectedChat._id);
                
                // Reset typing indicator for this chat
                setTypingUsers(prev => ({ ...prev, [selectedChat._id]: null }));
            }
        }
    }, [selectedChat]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Clear typing indicator after timeout
    useEffect(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (selectedChat && typingUsers[selectedChat._id]) {
            typingTimeoutRef.current = setTimeout(() => {
                setTypingUsers(prev => ({ ...prev, [selectedChat._id]: null }));
            }, 3000);
        }
    }, [typingUsers, selectedChat]);

    const fetchUserChats = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5560/api/chats/user/${userId}`);
            
            if (response.data.success) {
                setActiveChats(response.data.data.chats);
                
                // Auto-select first chat if none selected
                if (response.data.data.chats.length > 0 && !selectedChat) {
                    setSelectedChat(response.data.data.chats[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (chatId) => {
        try {
            const response = await axios.get(`http://localhost:5560/api/chats/${chatId}/messages`);
            
            if (response.data.success) {
                setMessages(response.data.data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const markMessagesAsRead = async (chatId) => {
        try {
            await axios.put(`http://localhost:5560/api/chats/${chatId}/read`, {
                userId: userId
            });
            
            // Reset unread count for this chat
            setActiveChats(prev => prev.map(chat => 
                chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
            ));
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim() || !selectedChat) return;

        const messageData = {
            chatId: selectedChat._id,
            senderId: userId,
            senderRole: userRole,
            content: newMessage.trim(),
            timestamp: new Date().toISOString()
        };

        try {
            // Send via socket for real-time
            socketRef.current.emit('send_message', messageData);
            
            // Also save to database
            await axios.post(`http://localhost:5560/api/chats/messages`, messageData);
            
            // Add message to local state immediately
            setMessages(prev => [...prev, messageData]);
            
            // Update active chats list
            setActiveChats(prev => prev.map(chat => {
                if (chat._id === selectedChat._id) {
                    return {
                        ...chat,
                        lastMessage: messageData.content,
                        lastMessageTime: messageData.timestamp
                    };
                }
                return chat;
            }));

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    };

    const handleTyping = (isTyping) => {
        if (!selectedChat || !socketRef.current) return;
        
        socketRef.current.emit('typing', {
            chatId: selectedChat._id,
            userId: userId,
            isTyping: isTyping
        });
    };

    const startNewChat = async (receiverId, receiverRole, receiverName) => {
        try {
            const response = await axios.post('http://localhost:5560/api/chats', {
                participant1: {
                    id: userId,
                    role: userRole,
                    name: userRole === 'parent' ? 'Liam\'s Parent' : 'Jim Lindsay'
                },
                participant2: {
                    id: receiverId,
                    role: receiverRole,
                    name: receiverName
                }
            });

            if (response.data.success) {
                const newChat = response.data.data.chat;
                setActiveChats(prev => [...prev, newChat]);
                setSelectedChat(newChat);
            }
        } catch (error) {
            console.error('Error starting new chat:', error);
        }
    };

    const deleteChat = async (chatId) => {
        if (!window.confirm('Are you sure you want to delete this chat? All messages will be lost.')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:5560/api/chats/${chatId}`);
            
            // Remove chat from state
            setActiveChats(prev => prev.filter(chat => chat._id !== chatId));
            
            // Clear selected chat if it's the deleted one
            if (selectedChat?._id === chatId) {
                setSelectedChat(null);
                setMessages([]);
            }
            
            alert('Chat deleted successfully');
        } catch (error) {
            console.error('Error deleting chat:', error);
            alert('Failed to delete chat');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const getChatPartner = (chat) => {
        const participants = chat.participants || [];
        const partner = participants.find(p => p.id !== userId);
        return partner || { name: 'Unknown User', role: 'unknown' };
    };

    if (loading) {
        return (
            <div className="chat-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading chats...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-page">
            {/* Header */}
            <div className="chat-header">
                <button 
                    className="back-btn"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>
                <h1>
                    <span className="chat-icon">💬</span>
                    Parent-Staff Communication
                </h1>
                <p className="subtitle">Real-time messaging with daycare staff</p>
            </div>

            <div className="chat-container">
                {/* Sidebar - Chat List */}
                <div className="chat-sidebar">
                    <div className="sidebar-header">
                        <h3>Active Chats</h3>
                        <div className="user-status">
                            <span className={`status-indicator ${onlineUsers.includes(userId) ? 'online' : 'offline'}`}></span>
                            <span>{userRole === 'parent' ? 'Parent' : 'Staff'}</span>
                        </div>
                    </div>

                    <div className="chat-list">
                        {activeChats.length === 0 ? (
                            <div className="empty-chats">
                                <div className="empty-icon">💬</div>
                                <p>No active chats</p>
                                <p className="empty-subtitle">Start a conversation</p>
                            </div>
                        ) : (
                            activeChats.map(chat => {
                                const partner = getChatPartner(chat);
                                const isOnline = onlineUsers.includes(partner.id);
                                
                                return (
                                    <div
                                        key={chat._id}
                                        className={`chat-list-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                                        onClick={() => setSelectedChat(chat)}
                                    >
                                        <div className="chat-avatar">
                                            <div className="avatar-icon">
                                                {partner.role === 'staff' ? '👩‍🏫' : '👨‍👩‍👧'}
                                            </div>
                                            {isOnline && <span className="online-badge"></span>}
                                        </div>
                                        
                                        <div className="chat-info">
                                            <div className="chat-name-row">
                                                <h4>{partner.name}</h4>
                                                <span className="chat-time">
                                                    {chat.lastMessageTime ? formatTime(chat.lastMessageTime) : ''}
                                                </span>
                                            </div>
                                            <p className="chat-preview">
                                                {chat.lastMessage || 'No messages yet'}
                                            </p>
                                            <div className="chat-meta">
                                                <span className="chat-role">
                                                    {partner.role === 'staff' ? 'Daycare Staff' : 'Parent'}
                                                </span>
                                                {chat.unreadCount > 0 && (
                                                    <span className="unread-badge">
                                                        {chat.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Start New Chat Section */}
                    <div className="new-chat-section">
                        <h4>Start New Chat</h4>
                        <div className="staff-list">
                            {userRole === 'parent' && (
                                <>
                                    <button 
                                        className="staff-item"
                                        onClick={() => startNewChat('STAFF001', 'staff', 'Jim Lindsay')}
                                    >
                                        <div className="staff-avatar">👨‍🏫</div>
                                        <div>
                                            <div className="staff-name">Jim Lindsay</div>
                                            <div className="staff-role">Lead Caregiver</div>
                                        </div>
                                    </button>
                                    
                                    <button 
                                        className="staff-item"
                                        onClick={() => startNewChat('STAFF002', 'staff', 'Sarah Johnson')}
                                    >
                                        <div className="staff-avatar">👩‍🏫</div>
                                        <div>
                                            <div className="staff-name">Sarah Johnson</div>
                                            <div className="staff-role">Assistant</div>
                                        </div>
                                    </button>
                                </>
                            )}
                            
                            {userRole === 'staff' && (
                                <>
                                    <button 
                                        className="staff-item"
                                        onClick={() => startNewChat('PARENT001', 'parent', 'Liam\'s Parent')}
                                    >
                                        <div className="staff-avatar">👨‍👩‍👧</div>
                                        <div>
                                            <div className="staff-name">Liam's Parent</div>
                                            <div className="staff-role">Parent</div>
                                        </div>
                                    </button>
                                    
                                    <button 
                                        className="staff-item"
                                        onClick={() => startNewChat('PARENT002', 'parent', 'Emma\'s Parent')}
                                    >
                                        <div className="staff-avatar">👨‍👩‍👧</div>
                                        <div>
                                            <div className="staff-name">Emma's Parent</div>
                                            <div className="staff-role">Parent</div>
                                        </div>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="chat-main">
                    {selectedChat ? (
                        <>
                            <div className="chat-header-bar">
                                <div className="chat-partner-info">
                                    <div className="chat-partner-avatar">
                                        {getChatPartner(selectedChat).role === 'staff' ? '👩‍🏫' : '👨‍👩‍👧'}
                                        {onlineUsers.includes(getChatPartner(selectedChat).id) && (
                                            <span className="online-badge"></span>
                                        )}
                                    </div>
                                    <div>
                                        <h3>{getChatPartner(selectedChat).name}</h3>
                                        <p className="partner-role">
                                            {getChatPartner(selectedChat).role === 'staff' ? 'Daycare Staff' : 'Parent'}
                                            {onlineUsers.includes(getChatPartner(selectedChat).id) && (
                                                <span className="online-status"> • Online</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="chat-actions">
                                    <button 
                                        className="action-btn delete-chat"
                                        onClick={() => deleteChat(selectedChat._id)}
                                        title="Delete chat"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div className="messages-container">
                                {messages.length === 0 ? (
                                    <div className="empty-messages">
                                        <div className="empty-icon">💬</div>
                                        <h4>No messages yet</h4>
                                        <p>Start the conversation by sending a message!</p>
                                    </div>
                                ) : (
                                    <div className="messages-list">
                                        {messages.map((message, index) => {
                                            const isOwnMessage = message.senderId === userId;
                                            const showDate = index === 0 || 
                                                formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
                                            
                                            return (
                                                <React.Fragment key={message._id || index}>
                                                    {showDate && (
                                                        <div className="date-divider">
                                                            {formatDate(message.timestamp)}
                                                        </div>
                                                    )}
                                                    
                                                    <div className={`message-bubble ${isOwnMessage ? 'own' : 'other'}`}>
                                                        <div className="message-content">
                                                            {message.content}
                                                        </div>
                                                        <div className="message-time">
                                                            {formatTime(message.timestamp)}
                                                            {isOwnMessage && (
                                                                <span className="read-status">
                                                                    {message.read ? '✓✓' : '✓'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}

                                {/* Typing Indicator */}
                                {typingUsers[selectedChat._id] && typingUsers[selectedChat._id] !== userId && (
                                    <div className="typing-indicator">
                                        <div className="typing-dots">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                        <span className="typing-text">typing...</span>
                                    </div>
                                )}
                            </div>

                            {/* Message Input */}
                            <form className="message-input-form" onSubmit={sendMessage}>
                                <div className="input-container">
                                    <button type="button" className="input-action-btn" title="Attach file">
                                        📎
                                    </button>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            handleTyping(true);
                                        }}
                                        onBlur={() => handleTyping(false)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                handleTyping(false);
                                                sendMessage(e);
                                            }
                                        }}
                                        placeholder="Type your message here..."
                                        className="message-input"
                                    />
                                    <button type="button" className="input-action-btn" title="Emoji">
                                        😊
                                    </button>
                                </div>
                                <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                                    Send
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <div className="welcome-icon">💬</div>
                            <h3>Welcome to Parent-Staff Chat</h3>
                            <p>Select a chat from the sidebar or start a new conversation</p>
                            <div className="features-list">
                                <div className="feature">
                                    <span className="feature-icon">⚡</span>
                                    <div>
                                        <h4>Real-time Messaging</h4>
                                        <p>Instant communication with daycare staff</p>
                                    </div>
                                </div>
                                <div className="feature">
                                    <span className="feature-icon">🔔</span>
                                    <div>
                                        <h4>Notifications</h4>
                                        <p>Get alerted for new messages</p>
                                    </div>
                                </div>
                                <div className="feature">
                                    <span className="feature-icon">👥</span>
                                    <div>
                                        <h4>Online Status</h4>
                                        <p>See when staff are available</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Connection Status */}
            <div className="chat-footer">
                <div className="footer-info">
                    <span className="connection-status">
                        <span className="status-indicator online"></span>
                        Connected • {onlineUsers.length} users online
                    </span>
                    <span className="message-count">
                        {activeChats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)} unread messages
                    </span>
                </div>
                <div className="footer-actions">
                    <button 
                        className="btn"
                        onClick={fetchUserChats}
                        title="Refresh chats"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;