import { useState, useEffect, useRef, useMemo } from 'react';
import api from '@services/root.service.js';
import { useSocket } from '@hooks/useSocket.jsx';
import '@styles/consultas.css';

export default function ConsultasPage() {
    const user = useMemo(() => JSON.parse(sessionStorage.getItem('usuario')) || {}, []);
    const userRole = user?.rol;
    const userId = user?.id;

    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const conversationId = selectedConversation?.id;
    const { messages: socketMessages, sendMessage, isConnected } = useSocket(conversationId, userId);

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, socketMessages]);

    // Merge socket messages with existing messages
    useEffect(() => {
        if (socketMessages.length > 0) {
            setMessages(prev => {
                const newMsgs = socketMessages.filter(
                    sm => !prev.some(pm => pm.id === sm.id)
                );
                return [...prev, ...newMsgs];
            });
        }
    }, [socketMessages]);

    // Load conversations (admin) or create/get conversation (student)
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                if (userRole === 'administrador') {
                    const response = await api.get('/messages/conversations');
                    setConversations(response.data.data || []);
                } else {
                    const response = await api.get(`/messages/conversation/${userId}`);
                    const conversation = response.data.data;
                    setSelectedConversation(conversation);
                    await loadMessages(conversation.id);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            loadData();
        }
    }, [userId, userRole]);

    const loadMessages = async (convId) => {
        try {
            const response = await api.get(`/messages/conversation/${convId}/messages`);
            setMessages(response.data.data || []);

            // Mark messages as read
            await api.put(`/messages/conversation/${convId}/read`);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleSelectConversation = async (conversation) => {
        setSelectedConversation(conversation);
        await loadMessages(conversation.id);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && conversationId) {
            sendMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando consultas...</p>
            </div>
        );
    }

    return (
        <div className="consultas-container">
            <div className="consultas-header">
                <h2>
                    <i className="fa-solid fa-comments"></i>
                    {userRole === 'administrador' ? 'Consultas de Estudiantes' : 'Consultas'}
                </h2>
                {isConnected ? (
                    <span className="connection-status connected">
                        <i className="fa-solid fa-circle"></i> Conectado
                    </span>
                ) : (
                    <span className="connection-status disconnected">
                        <i className="fa-solid fa-circle"></i> Desconectado
                    </span>
                )}
            </div>

            <div className="consultas-content">
                {userRole === 'administrador' ? (
                    <>
                        <div className="conversations-sidebar">
                            <div className="sidebar-header">
                                <h3>Conversaciones</h3>
                                <span className="conversation-count">{conversations.length}</span>
                            </div>
                            <div className="conversations-list">
                                {conversations.length === 0 ? (
                                    <div className="empty-state">
                                        <i className="fa-solid fa-inbox"></i>
                                        <p>No hay consultas aún</p>
                                    </div>
                                ) : (
                                    conversations.map(conv => (
                                        <div
                                            key={conv.id}
                                            className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                                            onClick={() => handleSelectConversation(conv)}
                                        >
                                            <div className="conversation-avatar">
                                                <i className="fa-solid fa-user"></i>
                                            </div>
                                            <div className="conversation-info">
                                                <h4>{conv.student?.nombreCompleto || 'Estudiante'}</h4>
                                                <p>{conv.student?.email}</p>
                                            </div>
                                            {conv.unreadByAdmin > 0 && (
                                                <span className="unread-badge">{conv.unreadByAdmin}</span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="chat-area">
                            {selectedConversation ? (
                                <>
                                    <div className="chat-header">
                                        <div className="chat-user-info">
                                            <i className="fa-solid fa-user-circle"></i>
                                            <div>
                                                <h3>{selectedConversation.student?.nombreCompleto}</h3>
                                                <p>{selectedConversation.student?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="messages-container">
                                        {messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}
                                            >
                                                <div className="message-content">
                                                    <p>{msg.content}</p>
                                                    <span className="message-time">
                                                        {new Date(msg.createdAt).toLocaleTimeString('es-ES', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <form className="message-input-form" onSubmit={handleSendMessage}>
                                        <input
                                            type="text"
                                            placeholder="Escribe tu respuesta..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        />
                                        <button type="submit" disabled={!newMessage.trim()}>
                                            <i className="fa-solid fa-paper-plane"></i>
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="no-conversation-selected">
                                    <i className="fa-solid fa-comments"></i>
                                    <p>Selecciona una conversación para comenzar</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="student-chat">
                        <div className="chat-header">
                            <div className="chat-user-info">
                                <i className="fa-solid fa-user-tie"></i>
                                <div>
                                    <h3>Coordinador de Prácticas</h3>
                                    <p>Consulta tus dudas sobre el proceso de prácticas</p>
                                </div>
                            </div>
                        </div>

                        <div className="messages-container">
                            {messages.length === 0 ? (
                                <div className="empty-chat">
                                    <i className="fa-solid fa-message"></i>
                                    <p>Inicia una conversación con el coordinador</p>
                                    <small>Puedes consultar sobre postulaciones, documentos, plazos, etc.</small>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}
                                    >
                                        <div className="message-content">
                                            <p>{msg.content}</p>
                                            <span className="message-time">
                                                {new Date(msg.createdAt).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="message-input-form" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Escribe tu consulta..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" disabled={!newMessage.trim()}>
                                <i className="fa-solid fa-paper-plane"></i>
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
