import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../theme/ThemeContext';
import { useSocket } from '../utils/useSocket';

const NotificationContainer = styled.div`
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 1000;
  max-width: 350px;
`;

const NotificationCard = styled.div`
  background: ${props => props.theme.containerBg};
  border: 3px solid ${props => props.type === 'request' ? '#FF9800' : 
                             props.type === 'accepted' ? '#4CAF50' : 
                             props.type === 'rejected' ? '#f44336' : props.theme.containerBorder};
  border-radius: 8px;
  box-shadow: 8px 8px 0 ${props => props.theme.containerBorder};
  padding: 1rem;
  margin-bottom: 1rem;
  animation: slideIn 0.3s ease-in-out;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateX(-5px);
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const NotificationTitle = styled.h4`
  margin: 0;
  color: ${props => props.theme.text};
  font-size: 1rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.text};
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    opacity: 0.7;
  }
`;

const NotificationContent = styled.div`
  color: ${props => props.theme.text};
  font-size: 0.9rem;
  line-height: 1.4;
`;

const NotificationIcon = styled.span`
  font-size: 1.5rem;
  margin-right: 0.5rem;
`;

export default function LoanNotification() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  
  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user/profile', {
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      }
    };
    fetchUser();
  }, []);

  const { socket } = useSocket(user?._id);

  useEffect(() => {
    if (!socket || !user) return;

    // Écouter les demandes de prêt
    socket.on('loan_request', (data) => {
      const notification = {
        id: `loan_request_${Date.now()}`,
        type: 'request',
        title: 'Nouvelle demande d\'emprunt',
        content: `${data.requester} souhaite emprunter "${data.bookTitle}"`,
        icon: '📚',
        timestamp: Date.now(),
        data: data
      };
      
      setNotifications(prev => [...prev, notification]);
      
      // Auto-supprimer après 10 secondes
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 10000);
    });

    // Écouter les acceptations de prêt
    socket.on('loan_accepted', (data) => {
      const notification = {
        id: `loan_accepted_${Date.now()}`,
        type: 'accepted',
        title: 'Demande acceptée !',
        content: `Votre demande pour "${data.bookTitle}" a été acceptée. Retour prévu le ${new Date(data.returnDate).toLocaleDateString('fr-FR')}.`,
        icon: '✅',
        timestamp: Date.now(),
        data: data
      };
      
      setNotifications(prev => [...prev, notification]);
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 15000);
    });

    // Écouter les refus de prêt
    socket.on('loan_rejected', (data) => {
      const notification = {
        id: `loan_rejected_${Date.now()}`,
        type: 'rejected',
        title: 'Demande refusée',
        content: `Votre demande pour "${data.bookTitle}" a été refusée. ${data.reason ? `Raison : ${data.reason}` : ''}`,
        icon: '❌',
        timestamp: Date.now(),
        data: data
      };
      
      setNotifications(prev => [...prev, notification]);
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 15000);
    });

    // Écouter les retours de livre
    socket.on('book_returned', (data) => {
      const notification = {
        id: `book_returned_${Date.now()}`,
        type: 'returned',
        title: 'Livre retourné',
        content: `Le livre "${data.bookTitle}" a été marqué comme retourné.`,
        icon: '📥',
        timestamp: Date.now(),
        data: data
      };
      
      setNotifications(prev => [...prev, notification]);
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 10000);
    });

    return () => {
      socket.off('loan_request');
      socket.off('loan_accepted');
      socket.off('loan_rejected');
      socket.off('book_returned');
    };
  }, [socket, user]);

  const handleNotificationClick = (notification) => {
    // Rediriger vers la page appropriée selon le type de notification
    if (notification.data.conversationId) {
      window.location.href = '/messagerie';
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <NotificationContainer>
      {notifications.map(notification => (
        <NotificationCard
          key={notification.id}
          theme={theme}
          type={notification.type}
          onClick={() => handleNotificationClick(notification)}
        >
          <NotificationHeader>
            <NotificationTitle theme={theme}>
              <NotificationIcon>{notification.icon}</NotificationIcon>
              {notification.title}
            </NotificationTitle>
            <CloseButton 
              theme={theme}
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
            >
              ×
            </CloseButton>
          </NotificationHeader>
          <NotificationContent theme={theme}>
            {notification.content}
          </NotificationContent>
        </NotificationCard>
      ))}
    </NotificationContainer>
  );
} 