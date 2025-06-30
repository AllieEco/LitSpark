import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { useTheme } from '../theme/ThemeContext';
import { useSocket } from '../utils/useSocket';
import MessageNotification from '../components/MessageNotification';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const bounceIn = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: transparent;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 13vh;
  padding-bottom: 4vh;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Container = styled.div`
  max-width: 1200px;
  width: 90%;
  background: ${props => props.theme.containerBg};
  border: 3px solid ${props => props.theme.containerBorder};
  border-radius: 12px;
  box-shadow: 8px 8px 0 ${props => props.theme.containerBorder};
  padding: 0;
  position: relative;
  z-index: 2;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 95%;
  }
`;

const Header = styled.div`
  background: ${props => props.theme.containerBorder}20;
  border-bottom: 2px solid ${props => props.theme.containerBorder};
  padding: 2.5rem 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.8rem;
  font-weight: 800;
  margin: 0;
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const MessagerieContainer = styled.div`
  display: flex;
  height: 650px;
  background: ${props => props.theme.containerBg};

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
`;

const ConversationsList = styled.div`
  width: 350px;
  border-right: 2px solid ${props => props.theme.containerBorder};
  background: ${props => props.theme.containerBg};
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 100%;
    height: 250px;
    border-right: none;
    border-bottom: 2px solid ${props => props.theme.containerBorder};
  }
`;

const ConversationsHeader = styled.div`
  padding: 2rem 1.5rem 1.5rem;
  border-bottom: 1px solid ${props => props.theme.containerBorder}40;
  background: ${props => props.theme.containerBorder}10;
`;

const ConversationsTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0;
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  gap: 0.8rem;
  
  &::before {
    content: '💬';
    font-size: 1.2rem;
  }
`;

const ConversationItem = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.containerBorder}20;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.active ? props.theme.containerBorder + '20' : 'transparent'};
  animation: ${slideIn} 0.4s ease-out;

  &:hover {
    background: ${props => props.theme.containerBorder}30;
  }
`;

const ConversationUser = styled.div`
  font-weight: 700;
  color: ${props => props.theme.text};
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ConversationPreview = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.text};
  opacity: 0.75;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 0.3rem;
  line-height: 1.4;
`;

const ConversationTime = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.text};
  opacity: 0.6;
  font-weight: 500;
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => props.isConnected ? '#4CAF50' : '#ff6b6b'};
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.isConnected ? '#4CAF50' : '#ff6b6b'};
    animation: ${props => props.isConnected ? pulse : 'none'} 2s infinite;
  }
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.containerBg};
  position: relative;
`;

const ChatHeader = styled.div`
  padding: 2rem 2rem 1.5rem;
  border-bottom: 1px solid ${props => props.theme.containerBorder}40;
  background: ${props => props.theme.containerBorder}10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const ChatUserName = styled.h3`
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  color: ${props => props.theme.text};
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  
  &::before {
    content: '👤';
    font-size: 1.2rem;
    opacity: 0.7;
  }
`;

const DeleteConversationButton = styled.button`
  background: transparent;
  border: 2px solid #ff6b6b;
  color: #ff6b6b;
  border-radius: 6px;
  padding: 0.8rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #ff6b6b;
    color: white;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      background: transparent;
      color: #ff6b6b;
      transform: none;
    }
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 420px;

  @media (max-width: 768px) {
    max-height: 300px;
    padding: 1.5rem;
  }
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
  animation: ${fadeIn} 0.5s ease-out;
`;

const MessageBubble = styled.div`
  background: ${props => props.isOwn ? props.theme.containerBorder : props.theme.containerBg};
  color: ${props => props.isOwn ? 'white' : props.theme.text};
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 18px;
  padding: 1rem 1.5rem;
  max-width: 75%;
  word-wrap: break-word;
  box-shadow: ${props => props.isOwn ? '3px 3px 0' + props.theme.containerBorder : 'none'};
  font-size: 1rem;
  line-height: 1.5;
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.text};
  opacity: 0.6;
  margin-top: 0.5rem;
  font-weight: 500;
`;

const MessageInputContainer = styled.div`
  padding: 2rem;
  border-top: 1px solid ${props => props.theme.containerBorder}40;
  background: ${props => props.theme.containerBg};
`;

const MessageInputForm = styled.form`
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  background: ${props => props.theme.containerBg};
  color: ${props => props.theme.text};
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  resize: none;
  min-height: 50px;
  max-height: 120px;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.containerBorder};
    box-shadow: 0 0 0 3px ${props => props.theme.containerBorder}40;
  }

  &::placeholder {
    color: ${props => props.theme.text};
    opacity: 0.5;
  }
`;

const SendButton = styled(Button)`
  min-width: auto;
  padding: 1rem 2rem;
  align-self: flex-end;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: ${props => props.theme.text};
  opacity: 0.7;
  padding: 4rem 2rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const EmptyStateIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: ${pulse} 2s infinite;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  color: ${props => props.theme.text};
`;

const EmptyStateText = styled.p`
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.6;
  opacity: 0.8;
`;

const RetourBtn = styled(Button)`
  margin: 2rem auto 0 auto;
  background: transparent;
  color: ${props => props.theme.text};
  border: 2px solid ${props => props.theme.containerBorder};
  
  &:hover {
    background: ${props => props.theme.containerBorder}20;
  }
`;

const NewMessageButton = styled(Button)`
  margin: 1.5rem;
  background: ${props => props.theme.containerBg};
  color: ${props => props.theme.text};
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 12px;
  padding: 1rem 2rem;
  font-weight: 700;
  box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 6px 6px 0 ${props => props.theme.containerBorder};
    background: ${props => props.theme.buttonHoverBg};
  }

  &:active {
    transform: translateY(0);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.containerBg};
  border: 3px solid ${props => props.theme.containerBorder};
  border-radius: 12px;
  box-shadow: 8px 8px 0 ${props => props.theme.containerBorder};
  padding: 2.5rem;
  width: 90%;
  max-width: 550px;
  animation: ${bounceIn} 0.5s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${props => props.theme.containerBorder}20;
`;

const ModalTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  color: ${props => props.theme.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: ${props => props.theme.text};
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.7;
    background: ${props => props.theme.containerBorder}15;
    transform: rotate(90deg);
  }
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Input = styled.input`
  background: ${props => props.theme.containerBg};
  color: ${props => props.theme.text};
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.containerBorder};
    box-shadow: 0 0 0 3px ${props => props.theme.containerBorder}40;
  }

  &::placeholder {
    color: ${props => props.theme.text};
    opacity: 0.5;
  }
`;

const TextArea = styled.textarea`
  background: ${props => props.theme.containerBg};
  color: ${props => props.theme.text};
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.containerBorder};
    box-shadow: 0 0 0 3px ${props => props.theme.containerBorder}40;
  }

  &::placeholder {
    color: ${props => props.theme.text};
    opacity: 0.5;
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #ff6b6b20;
  border-radius: 4px;
  border: 1px solid #ff6b6b40;
`;

const SuccessMessage = styled.div`
  color: #4caf50;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #4caf5020;
  border-radius: 4px;
  border: 1px solid #4caf5040;
`;

const UnreadBadge = styled.span`
  background: #2196f3;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  margin-left: 0.5rem;
`;

const BookPreview = styled.div`
  background: ${props => props.theme.containerBorder}10;
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const BookPreviewImage = styled.div`
  width: 60px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  background: ${props => props.theme.containerBorder}20;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const BookPreviewInfo = styled.div`
  flex: 1;
`;

const BookPreviewTitle = styled.div`
  font-weight: 800;
  color: ${props => props.theme.text};
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  line-height: 1.3;
`;

const BookPreviewAuthor = styled.div`
  color: ${props => props.theme.text};
  opacity: 0.8;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const BookPreviewOwner = styled.div`
  color: ${props => props.theme.containerBorder};
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ChatBookPreview = styled.div`
  background: ${props => props.theme.containerBorder}10;
  border: 1px solid ${props => props.theme.containerBorder}40;
  border-radius: 8px;
  padding: 0.8rem;
  margin: 0 0 1rem 0;
  display: flex;
  gap: 0.8rem;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.containerBorder}20;
    border-color: ${props => props.theme.containerBorder}60;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ChatBookImage = styled.div`
  width: 45px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  background: ${props => props.theme.containerBorder}20;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ChatBookInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ChatBookTitle = styled.div`
  font-weight: 700;
  color: ${props => props.theme.text};
  font-size: 1rem;
  margin-bottom: 0.3rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
`;

const ChatBookAuthor = styled.div`
  color: ${props => props.theme.text};
  opacity: 0.8;
  font-size: 0.9rem;
  font-weight: 600;
`;

const ChatBookLabel = styled.div`
  color: ${props => props.theme.containerBorder};
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

export default function Messagerie() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedBookInfo, setSelectedBookInfo] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingConversation, setDeletingConversation] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  
  // Hook WebSocket
  const { 
    socket, 
    isConnected, 
    joinConversation, 
    leaveConversation, 
    markAsRead, 
    onNewMessage, 
    onConversationUpdated, 
    onNewConversation, 
    onMessagesRead, 
    cleanup 
  } = useSocket(user?._id);

  useEffect(() => {
    const fetchUser = () => {
      fetch('http://localhost:5000/api/user', {
        credentials: 'include'
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Non connecté');
        })
        .then(data => {
          setUser(data);
          loadConversations();
        })
        .catch(() => {
          navigate('/connexion');
        });
    };
    fetchUser();
  }, [navigate]);

  // Configuration des événements WebSocket
  useEffect(() => {
    if (!isConnected || !user) return;

    // Écouter les nouveaux messages
    onNewMessage((messageData) => {
      console.log('Nouveau message reçu:', messageData);
      
      // Si le message est pour la conversation actuellement sélectionnée
      if (selectedConversation && messageData.conversationId === selectedConversation.id) {
        const newMessage = {
          id: messageData.id,
          content: messageData.content,
          isOwn: messageData.sender === user._id,
          timestamp: messageData.timestamp
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Marquer automatiquement comme lu si c'est la conversation active
        markAsRead(messageData.conversationId);
      } else {
        // Afficher une notification si le message n'est pas pour la conversation active
        // et si ce n'est pas notre propre message
        if (messageData.sender !== user._id) {
          setNotification(messageData);
        }
      }
      
      // Mettre à jour la liste des conversations
      loadConversations();
    });

    // Écouter les mises à jour de conversation
    onConversationUpdated((data) => {
      console.log('Conversation mise à jour:', data);
      loadConversations();
    });

    // Écouter les nouvelles conversations
    onNewConversation((data) => {
      console.log('Nouvelle conversation reçue:', data);
      loadConversations();
    });

    // Écouter les messages marqués comme lus
    onMessagesRead((data) => {
      console.log('Messages marqués comme lus:', data);
      if (selectedConversation && data.conversationId === selectedConversation.id) {
        // Mettre à jour l'état des messages dans la conversation active
        setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
      }
    });

    // Nettoyer les listeners à la déconnexion
    return cleanup;
  }, [isConnected, user, selectedConversation, onNewMessage, onConversationUpdated, onNewConversation, onMessagesRead, markAsRead, cleanup]);

  // Détecter si on vient d'une page de livre pour ouvrir automatiquement le modal
  useEffect(() => {
    if (location.state?.newMessage && location.state?.bookInfo) {
      const bookInfo = location.state.bookInfo;
      setShowNewMessageModal(true);
      setNewMessageRecipient(bookInfo.proprietaire);
      
      // Créer un message préfait avec les infos du livre
      const messageTemplate = `Bonjour ! 

Je suis intéressé(e) par votre livre :

📚 "${bookInfo.titre}"
✍️ par ${bookInfo.auteur}

Pourriez-vous me dire s'il est toujours disponible ?

Merci !`;
      
      setNewMessageContent(messageTemplate);
    }
  }, [location.state]);

  const loadConversations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/conversations', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Conversations reçues:', data.conversations);
        setConversations(data.conversations || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = async (conversation) => {
    // Quitter la conversation précédente si elle existe
    if (selectedConversation) {
      leaveConversation(selectedConversation.id);
    }

    setSelectedConversation(conversation);
    console.log('Conversation sélectionnée:', conversation);
    console.log('BookInfo de la conversation:', conversation.bookInfo);
    setSelectedBookInfo(conversation.bookInfo || null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/conversations/${conversation.id}/messages`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        
        // Rejoindre la nouvelle conversation via WebSocket
        joinConversation(conversation.id);
        
        // Marquer la conversation comme lue
        await fetch(`http://localhost:5000/api/conversations/${conversation.id}/read`, {
          method: 'PUT',
          credentials: 'include'
        });
        
        // Marquer aussi via WebSocket
        markAsRead(conversation.id);
        
        loadConversations(); // Recharger pour mettre à jour les indicateurs
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await fetch(`http://localhost:5000/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: newMessage
        })
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages([...messages, newMsg]);
        setNewMessage('');
        loadConversations(); // Recharger les conversations pour mettre à jour le dernier message
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleNewMessage = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (!newMessageRecipient.trim() || !newMessageContent.trim()) {
      setModalError('Veuillez remplir tous les champs');
      return;
    }

    // Enlever le @ si présent
    const username = newMessageRecipient.replace('@', '');

    try {
      const bookInfoToSend = location.state?.bookInfo || null;
      console.log('BookInfo à envoyer:', bookInfoToSend);
      
      const response = await fetch('http://localhost:5000/api/conversations/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          recipient: username,
          message: newMessageContent,
          bookInfo: bookInfoToSend
        })
      });

      const data = await response.json();

      if (response.ok) {
        setModalSuccess('Message envoyé avec succès !');
        setNewMessageRecipient('');
        setNewMessageContent('');
        loadConversations();
        setTimeout(() => {
          setShowNewMessageModal(false);
          setModalSuccess('');
          // Nettoyer le state de navigation
          if (location.state?.newMessage) {
            navigate('/messagerie', { replace: true, state: {} });
          }
        }, 2000);
      } else {
        setModalError(data.message || 'Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setModalError('Erreur de connexion');
    }
  };

  const closeModal = () => {
    setShowNewMessageModal(false);
    setNewMessageRecipient('');
    setNewMessageContent('');
    setModalError('');
    setModalSuccess('');
    
    // Nettoyer le state de navigation pour éviter la réouverture automatique
    if (location.state?.newMessage) {
      navigate('/messagerie', { replace: true, state: {} });
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;
    
    setDeletingConversation(true);
    try {
      const response = await fetch(`http://localhost:5000/api/conversations/${selectedConversation.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        // Réinitialiser l'état
        setSelectedConversation(null);
        setSelectedBookInfo(null);
        setMessages([]);
        setShowDeleteConfirm(false);
        
        // Recharger la liste des conversations
        loadConversations();
      } else {
        const data = await response.json();
        alert(data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la conversation');
    } finally {
      setDeletingConversation(false);
    }
  };

  const handleBookPreviewClick = () => {
    if (selectedBookInfo && selectedBookInfo.bookId) {
      navigate(`/livre-recherche/${selectedBookInfo.bookId}`);
    }
  };

  if (loading) {
    return (
      <Wrapper>
        <Logo />
        <Container theme={theme}>
          <Header theme={theme}>
            <Title theme={theme}>
              💬 Messagerie
            </Title>
          </Header>
          <div style={{ padding: '3rem', textAlign: 'center', color: theme.text }}>
            Chargement...
          </div>
        </Container>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Logo />
      <Container theme={theme}>
        <Header theme={theme}>
          <Title theme={theme}>
            <Logo size="2.5rem" />
            Messagerie
          </Title>
          <ConnectionStatus isConnected={isConnected} theme={theme}>
            {isConnected ? 'Connecté en temps réel' : 'Déconnecté'}
          </ConnectionStatus>
        </Header>
        
        <MessagerieContainer>
          <ConversationsList theme={theme}>
            <ConversationsHeader theme={theme}>
              <ConversationsTitle theme={theme}>
                Conversations
                {unreadCount > 0 && <UnreadBadge>{unreadCount}</UnreadBadge>}
              </ConversationsTitle>
            </ConversationsHeader>
            <NewMessageButton onClick={() => setShowNewMessageModal(true)}>
              ✉️ Nouveau message
            </NewMessageButton>
            {conversations.map(conversation => (
              <ConversationItem
                key={conversation.id}
                theme={theme}
                active={selectedConversation?.id === conversation.id}
                onClick={() => handleConversationSelect(conversation)}
              >
                <ConversationUser theme={theme}>
                  {conversation.username}
                  {conversation.unreadCount > 0 && (
                    <UnreadBadge>{conversation.unreadCount}</UnreadBadge>
                  )}
                </ConversationUser>
                <ConversationPreview theme={theme}>
                  {conversation.lastMessage}
                </ConversationPreview>
                <ConversationTime theme={theme}>
                  {conversation.timestamp}
                </ConversationTime>
              </ConversationItem>
            ))}
            {conversations.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: theme.text, opacity: 0.6 }}>
                Aucune conversation
              </div>
            )}
          </ConversationsList>

          <ChatArea theme={theme}>
            {selectedConversation ? (
              <>
                <ChatHeader theme={theme}>
                  <ChatUserName theme={theme}>{selectedConversation.username}</ChatUserName>
                  <DeleteConversationButton 
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deletingConversation}
                  >
                    🗑️ Supprimer
                  </DeleteConversationButton>
                </ChatHeader>
                
                {selectedBookInfo && (
                  <div style={{ padding: '0 1.5rem' }}>
                    {console.log('selectedBookInfo dans le rendu:', selectedBookInfo)}
                    <ChatBookPreview theme={theme} onClick={handleBookPreviewClick}>
                      <ChatBookImage theme={theme}>
                        {selectedBookInfo.imageUrl ? (
                          <img src={selectedBookInfo.imageUrl} alt={selectedBookInfo.titre} />
                        ) : (
                          <div style={{ fontSize: '1.2rem', opacity: 0.5 }}>📚</div>
                        )}
                      </ChatBookImage>
                      <ChatBookInfo>
                        <ChatBookLabel theme={theme}>📖 Livre concerné (cliquez pour voir les détails)</ChatBookLabel>
                        <ChatBookTitle theme={theme}>{selectedBookInfo.titre || 'Titre manquant'}</ChatBookTitle>
                        <ChatBookAuthor theme={theme}>par {selectedBookInfo.auteur || 'Auteur manquant'}</ChatBookAuthor>
                      </ChatBookInfo>
                    </ChatBookPreview>
                  </div>
                )}
                
                <MessagesContainer>
                  {messages.map(message => (
                    <Message key={message.id} isOwn={message.isOwn}>
                      <MessageBubble theme={theme} isOwn={message.isOwn}>
                        {message.content}
                      </MessageBubble>
                      <MessageTime theme={theme}>
                        {message.timestamp}
                      </MessageTime>
                    </Message>
                  ))}
                </MessagesContainer>

                <MessageInputContainer theme={theme}>
                  <MessageInputForm onSubmit={handleSendMessage}>
                    <MessageInput
                      theme={theme}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Tapez votre message..."
                      rows="1"
                    />
                    <SendButton type="submit">Envoyer 📤</SendButton>
                  </MessageInputForm>
                </MessageInputContainer>
              </>
            ) : (
              <EmptyState theme={theme}>
                <EmptyStateIcon>💬</EmptyStateIcon>
                <EmptyStateTitle>Sélectionnez une conversation</EmptyStateTitle>
                <EmptyStateText>
                  Choisissez une conversation dans la liste pour commencer à échanger
                </EmptyStateText>
              </EmptyState>
            )}
          </ChatArea>
        </MessagerieContainer>

        <div style={{ padding: '1.5rem', textAlign: 'center', borderTop: `1px solid ${theme.containerBorder}40` }}>
          <RetourBtn theme={theme} onClick={() => navigate('/recherche')}>
            ← Retour à la recherche
          </RetourBtn>
        </div>
      </Container>

      {showNewMessageModal && (
        <Modal>
          <ModalContent theme={theme}>
            <ModalHeader>
              <ModalTitle theme={theme}>Nouveau message</ModalTitle>
              <CloseButton onClick={closeModal}>×</CloseButton>
            </ModalHeader>
            <ModalForm onSubmit={handleNewMessage}>
              {location.state?.bookInfo && (
                <BookPreview theme={theme}>
                  <BookPreviewImage theme={theme}>
                    {location.state.bookInfo.imageUrl ? (
                      <img src={location.state.bookInfo.imageUrl} alt={location.state.bookInfo.titre} />
                    ) : (
                      <div style={{ fontSize: '1.5rem', opacity: 0.5 }}>📚</div>
                    )}
                  </BookPreviewImage>
                  <BookPreviewInfo>
                    <BookPreviewTitle theme={theme}>{location.state.bookInfo.titre}</BookPreviewTitle>
                    <BookPreviewAuthor theme={theme}>par {location.state.bookInfo.auteur}</BookPreviewAuthor>
                    <BookPreviewOwner theme={theme}>Propriétaire : {location.state.bookInfo.proprietaire}</BookPreviewOwner>
                  </BookPreviewInfo>
                </BookPreview>
              )}
              
              <div>
                <label style={{ color: theme.text, fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Destinataire (nom d'utilisateur)
                </label>
                <Input
                  theme={theme}
                  type="text"
                  placeholder="@nomutilisateur ou nomutilisateur"
                  value={newMessageRecipient}
                  onChange={(e) => setNewMessageRecipient(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ color: theme.text, fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Message
                </label>
                <TextArea
                  theme={theme}
                  placeholder="Tapez votre message..."
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                  required
                />
              </div>
              {modalError && <ErrorMessage>{modalError}</ErrorMessage>}
              {modalSuccess && <SuccessMessage>{modalSuccess}</SuccessMessage>}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Annuler
                </Button>
                <Button type="submit">
                  Envoyer 📤
                </Button>
              </div>
            </ModalForm>
          </ModalContent>
        </Modal>
      )}

      {showDeleteConfirm && (
        <Modal>
          <ModalContent theme={theme}>
            <ModalHeader>
              <ModalTitle theme={theme}>Supprimer la conversation</ModalTitle>
              <CloseButton onClick={() => setShowDeleteConfirm(false)}>×</CloseButton>
            </ModalHeader>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: theme.text, margin: '0 0 1rem 0' }}>
                Êtes-vous sûr de vouloir supprimer cette conversation avec <strong>{selectedConversation?.username}</strong> ?
              </p>
              <p style={{ color: theme.text, opacity: 0.7, fontSize: '0.9rem', margin: 0 }}>
                ⚠️ Cette action est irréversible. Tous les messages seront définitivement supprimés.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deletingConversation}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleDeleteConversation}
                disabled={deletingConversation}
                style={{ 
                  background: '#ff6b6b',
                  borderColor: '#ff6b6b'
                }}
              >
                {deletingConversation ? '⏳ Suppression...' : '🗑️ Supprimer'}
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}

      {/* Notification de nouveau message */}
      {notification && (
        <MessageNotification
          message={notification}
          onClose={() => setNotification(null)}
          theme={theme}
        />
      )}
    </Wrapper>
  );
} 