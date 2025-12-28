import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
    const [isRefreshing, setIsRefreshing] = useState(false);
    const messagesEndRef = useRef(null);

    const conversationId = selectedConversation?.id;
    const { messages: socketMessages, sendMessage, isConnected } = useSocket(conversationId, userId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, socketMessages]);

    // Carga de mensajes individual
    const loadMessages = useCallback(async (convId) => {
        try {
            const response = await api.get(`/messages/conversation/${convId}/messages`);
            setMessages(response.data.data || []);
            await api.put(`/messages/conversation/${convId}/read`);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }, []);

    // Carga inicial de datos
    const loadData = useCallback(async (manual = false) => {
        try {
            if (manual) setIsRefreshing(true);
            else setLoading(true);

            if (userRole === 'administrador') {
                const response = await api.get('/messages/conversations');
                setConversations(response.data.data || []);
            } else {
                const response = await api.get(`/messages/conversation/${userId}`);
                const conversation = response.data.data;
                setSelectedConversation(conversation);
                if (conversation?.id) {
                    await loadMessages(conversation.id);
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [userId, userRole, loadMessages]);

    useEffect(() => {
        if (userId) loadData();
    }, [userId, loadData]);

    // Integrar mensajes del socket
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
                <div className="header-actions">
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
            </div>

            <div className="consultas-content">
                {userRole === 'administrador' ? (
                    <>
                        <div className="conversations-sidebar">
                            <div className="sidebar-header">
                                <div className="sidebar-title-row">
                                    <h3>Conversaciones</h3>
                                    <button
                                        className={`refresh-icon-button ${isRefreshing ? 'spinning' : ''}`}
                                        onClick={() => loadData(true)}
                                        disabled={isRefreshing}
                                    >
                                        <i className="fa-solid fa-rotate"></i>
                                    </button>
                                </div>
                                <span className="conversation-count">{conversations.length}</span>
                            </div>
                            <div className="conversations-list">
                                {conversations.length === 0 ? (
                                    /* ESTA ES LA PARTE QUE DEBES CORREGIR */
                                    <div className="empty-state" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                        <i className="fa-solid fa-inbox" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
                                        <p>No hay consultas nuevas de estudiantes.</p>
                                        <small>Las conversaciones aparecerán aquí cuando un estudiante inicie un chat.</small>
                                    </div>
                                ) : (
                                    conversations.map(conv => (
                                        <div
                                            key={conv.id}
                                            className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                                            onClick={() => handleSelectConversation(conv)}
                                        >
                                            <div className="conversation-avatar"><i className="fa-solid fa-user"></i></div>
                                            <div className="conversation-info">
                                                <h4>{conv.student?.nombreCompleto || 'Estudiante'}</h4>
                                                <p>{conv.student?.email}</p>
                                            </div>
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
                                            <div key={msg.id} className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}>
                                                <div className="message-content">
                                                    <p>{msg.content}</p>
                                                    <span className="message-time">
                                                        {new Date(msg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                    <form className="message-input-form" onSubmit={handleSendMessage}>
                                        <input type="text" placeholder="Escribe..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                                        <button type="submit" disabled={!newMessage.trim()}><i className="fa-solid fa-paper-plane"></i></button>
                                    </form>
                                </>
                            ) : (
                                <div className="no-conversation-selected">
                                    <i className="fa-solid fa-comments"></i>
                                    <p>Selecciona una conversación</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* VISTA ESTUDIANTE COMPLETA */
                    <div className="student-chat">
                        <div className="chat-header">
                            <div className="chat-user-info">
                                <i className="fa-solid fa-user-tie"></i>
                                <div>
                                    <h3>Coordinador de Prácticas</h3>
                                    <p>Consulta tus dudas sobre el proceso</p>
                                </div>
                            </div>
                            <button
                                className={`refresh-icon-button ${isRefreshing ? 'spinning' : ''}`}
                                onClick={() => loadData(true)}
                                disabled={isRefreshing}
                            >
                                <i className="fa-solid fa-rotate"></i>
                            </button>
                        </div>

                        <div className="messages-container">
                            {messages.length === 0 ? (
                                <div className="empty-chat">
                                    <i className="fa-solid fa-message"></i>
                                    <p>Inicia una conversación...</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.id} className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}>
                                        <div className="message-content">
                                            <p>{msg.content}</p>
                                            <span className="message-time">
                                                {new Date(msg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="message-input-form" onSubmit={handleSendMessage}>
                            <input type="text" placeholder="Escribe tu consulta..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                            <button type="submit" disabled={!newMessage.trim()}><i className="fa-solid fa-paper-plane"></i></button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}