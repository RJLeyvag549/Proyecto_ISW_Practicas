import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export const useSocket = (conversationId, userId) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketInstance = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
        });

        socketInstance.on('connect', () => {
            console.log('Conectado a Socket.io');
            setIsConnected(true);

            if (conversationId) {
                socketInstance.emit('join_conversation', conversationId);
            }
        });

        socketInstance.on('disconnect', () => {
            console.log('Desconectado de Socket.io');
            setIsConnected(false);
        });

        socketInstance.on('new_message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socketInstance.on('user_typing', (data) => {
            // Handle typing indicator
            console.log('Usuario escribiendo:', data);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [conversationId]);

    const sendMessage = useCallback((content) => {
        if (socket && conversationId && userId) {
            socket.emit('send_message', {
                conversationId,
                senderId: userId,
                content,
            });
        }
    }, [socket, conversationId, userId]);

    const sendTyping = useCallback((isTyping) => {
        if (socket && conversationId && userId) {
            socket.emit('typing', {
                conversationId,
                userId,
                isTyping,
            });
        }
    }, [socket, conversationId, userId]);

    return {
        socket,
        messages,
        setMessages,
        isConnected,
        sendMessage,
        sendTyping,
    };
};
