import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${props => props.theme.containerBorder};
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-width: 300px;
  animation: ${props => props.show ? slideIn : slideOut} 0.3s ease-out;
  transform: translateX(${props => props.show ? '0' : '100%'});
  opacity: ${props => props.show ? '1' : '0'};
  pointer-events: ${props => props.show ? 'auto' : 'none'};
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const NotificationTitle = styled.div`
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

const NotificationContent = styled.div`
  font-size: 0.85rem;
  line-height: 1.4;
  opacity: 0.9;
`;

const MessagePreview = styled.div`
  font-size: 0.8rem;
  opacity: 0.8;
  margin-top: 0.5rem;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export default function MessageNotification({ message, onClose, theme }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300); // Attendre l'animation de sortie
    }, 5000); // Auto-fermeture après 5 secondes

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  if (!message) return null;

  return (
    <NotificationContainer show={show} theme={theme}>
      <NotificationHeader>
        <NotificationTitle>
          💬 Nouveau message de {message.senderUsername}
        </NotificationTitle>
        <CloseButton onClick={handleClose}>×</CloseButton>
      </NotificationHeader>
      <NotificationContent>
        Nouveau message reçu
      </NotificationContent>
      <MessagePreview>
        "{message.content.substring(0, 50)}..."
      </MessagePreview>
    </NotificationContainer>
  );
} 