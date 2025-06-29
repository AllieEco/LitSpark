import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const useSocket = (userId) => {
  const socketRef = useRef(null);
  const isConnectedRef = useRef(false);

  // Initialiser la connexion Socket.IO
  const connect = useCallback(() => {
    if (!userId || socketRef.current?.connected) return;

    console.log('Connexion Socket.IO...');
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log('Connecté à Socket.IO');
      isConnectedRef.current = true;
      
      // Authentifier l'utilisateur
      socketRef.current.emit('authenticate', userId);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Déconnecté de Socket.IO');
      isConnectedRef.current = false;
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Erreur de connexion Socket.IO:', error);
      isConnectedRef.current = false;
    });
  }, [userId]);

  // Rejoindre une conversation
  const joinConversation = useCallback((conversationId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_conversation', conversationId);
    }
  }, []);

  // Quitter une conversation
  const leaveConversation = useCallback((conversationId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_conversation', conversationId);
    }
  }, []);

  // Marquer les messages comme lus
  const markAsRead = useCallback((conversationId) => {
    if (socketRef.current?.connected && userId) {
      socketRef.current.emit('mark_as_read', {
        conversationId,
        userId
      });
    }
  }, [userId]);

  // Écouter les nouveaux messages
  const onNewMessage = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('new_message', callback);
    }
  }, []);

  // Écouter les mises à jour de conversation
  const onConversationUpdated = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('conversation_updated', callback);
    }
  }, []);

  // Écouter les nouvelles conversations
  const onNewConversation = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('new_conversation', callback);
    }
  }, []);

  // Écouter les messages marqués comme lus
  const onMessagesRead = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('messages_read', callback);
    }
  }, []);

  // Nettoyer les listeners
  const cleanup = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('new_message');
      socketRef.current.off('conversation_updated');
      socketRef.current.off('new_conversation');
      socketRef.current.off('messages_read');
    }
  }, []);

  // Déconnecter
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
    }
  }, []);

  // Connexion automatique quand l'userId change
  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected: isConnectedRef.current,
    joinConversation,
    leaveConversation,
    markAsRead,
    onNewMessage,
    onConversationUpdated,
    onNewConversation,
    onMessagesRead,
    cleanup,
    disconnect
  };
}; 