import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { useTheme } from '../theme/ThemeContext';

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: transparent;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 17vh;
  padding-bottom: 4vh;
`;

const Container = styled.div`
  max-width: 800px;
  width: 85%;
  background: ${props => props.theme.containerBg};
  border: 3px solid ${props => props.theme.containerBorder};
  border-radius: 12px;
  box-shadow: 8px 8px 0 ${props => props.theme.containerBorder};
  padding: 3rem 2.5rem;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    width: 95%;
    padding: 2rem 1.5rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  color: ${props => props.theme.text};

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${props => props.theme.text};
  opacity: 0.8;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const MessageSection = styled.div`
  background: ${props => props.theme.inputBg};
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  padding: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: ${props => props.theme.text};
`;

const SectionDescription = styled.p`
  font-size: 0.9rem;
  color: ${props => props.theme.text};
  opacity: 0.7;
  margin: 0 0 1rem 0;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  background: ${props => props.theme.containerBg};
  color: ${props => props.theme.text};
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  max-height: 200px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const VariablesList = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: ${props => props.theme.containerBg};
  border: 1px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
`;

const VariableItem = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.text};
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: ${props => props.theme.text};
  font-size: 1.1rem;
`;

const Message = styled.div`
  text-align: center;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  background: ${props => props.success ? '#d4edda' : '#f8d7da'};
  color: ${props => props.success ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.success ? '#c3e6cb' : '#f5c6cb'};
`;

export default function MessagesPersonnalises() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [messages, setMessages] = useState({
    messageRetour: '',
    messageAcceptation: '',
    messageRefus: ''
  });

  useEffect(() => {
    // Vérifier l'authentification
    fetch('http://localhost:5000/api/user', {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error('Non connecté');
        return res.json();
      })
      .then(() => {
        // Charger les messages personnalisés
        return fetch('http://localhost:5000/api/user/messages-personnalises', {
          credentials: 'include'
        });
      })
      .then(res => res.json())
      .then(data => {
        if (data.messagesPersonnalises) {
          setMessages({
            messageRetour: data.messagesPersonnalises.messageRetour || '',
            messageAcceptation: data.messagesPersonnalises.messageAcceptation || '',
            messageRefus: data.messagesPersonnalises.messageRefus || ''
          });
        }
        setLoading(false);
      })
      .catch(() => {
        navigate('/connexion');
      });
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setMessages(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/user/messages-personnalises', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(messages)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Messages personnalisés sauvegardés avec succès !');
        setMessageType('success');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
      } else {
        setMessage(data.message || 'Erreur lors de la sauvegarde');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur de connexion');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setMessages({
      messageRetour: 'Merci d\'avoir rendu "{titre}" ! 📚 Le livre est de nouveau disponible pour d\'autres emprunts. J\'espère que vous avez apprécié votre lecture !',
      messageAcceptation: 'Super ! J\'accepte de vous prêter "{titre}" 📖 Le livre est maintenant réservé pour vous jusqu\'au {dateRetour}. Contactez-moi pour organiser la remise !',
      messageRefus: 'Désolé, je ne peux pas prêter "{titre}" pour le moment. 😔 Le livre est de nouveau disponible pour d\'autres demandes.'
    });
  };

  if (loading) {
    return (
      <Wrapper>
        <Logo />
        <Container theme={theme}>
          <LoadingState theme={theme}>
            Chargement de vos messages personnalisés...
          </LoadingState>
        </Container>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Logo />
      <Container theme={theme}>
        <Header>
          <Title theme={theme}>Messages personnalisés</Title>
          <Subtitle theme={theme}>
            Personnalisez les messages automatiques envoyés lors des prêts de livres
          </Subtitle>
        </Header>

        {message && (
          <Message success={messageType === 'success'}>
            {message}
          </Message>
        )}

        <Form onSubmit={handleSubmit}>
          <MessageSection theme={theme}>
            <SectionTitle theme={theme}>📥 Message de retour</SectionTitle>
            <SectionDescription theme={theme}>
              Message envoyé automatiquement quand vous confirmez le retour d'un livre
            </SectionDescription>
            <TextArea
              theme={theme}
              value={messages.messageRetour}
              onChange={(e) => handleInputChange('messageRetour', e.target.value)}
              placeholder="Entrez votre message de retour..."
            />
            <VariablesList theme={theme}>
              <VariableItem theme={theme}>
                <strong>Variables disponibles :</strong>
              </VariableItem>
              <VariableItem theme={theme}>
                • <code>{'{'}titre{'}'}</code> - Titre du livre
              </VariableItem>
            </VariablesList>
          </MessageSection>

          <MessageSection theme={theme}>
            <SectionTitle theme={theme}>✅ Message d'acceptation</SectionTitle>
            <SectionDescription theme={theme}>
              Message envoyé automatiquement quand vous acceptez une demande de prêt
            </SectionDescription>
            <TextArea
              theme={theme}
              value={messages.messageAcceptation}
              onChange={(e) => handleInputChange('messageAcceptation', e.target.value)}
              placeholder="Entrez votre message d'acceptation..."
            />
            <VariablesList theme={theme}>
              <VariableItem theme={theme}>
                <strong>Variables disponibles :</strong>
              </VariableItem>
              <VariableItem theme={theme}>
                • <code>{'{'}titre{'}'}</code> - Titre du livre
              </VariableItem>
              <VariableItem theme={theme}>
                • <code>{'{'}dateRetour{'}'}</code> - Date de retour prévue
              </VariableItem>
            </VariablesList>
          </MessageSection>

          <MessageSection theme={theme}>
            <SectionTitle theme={theme}>❌ Message de refus</SectionTitle>
            <SectionDescription theme={theme}>
              Message envoyé automatiquement quand vous refusez une demande de prêt (utilisé seulement si vous ne spécifiez pas de raison)
            </SectionDescription>
            <TextArea
              theme={theme}
              value={messages.messageRefus}
              onChange={(e) => handleInputChange('messageRefus', e.target.value)}
              placeholder="Entrez votre message de refus..."
            />
            <VariablesList theme={theme}>
              <VariableItem theme={theme}>
                <strong>Variables disponibles :</strong>
              </VariableItem>
              <VariableItem theme={theme}>
                • <code>{'{'}titre{'}'}</code> - Titre du livre
              </VariableItem>
            </VariablesList>
          </MessageSection>

          <ButtonContainer>
            <Button onClick={() => navigate('/compte')}>
              ← Retour au compte
            </Button>
            <Button 
              type="button" 
              onClick={handleReset}
              style={{ background: '#6c757d' }}
            >
              Restaurer par défaut
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              style={{ background: '#28a745', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
            </Button>
          </ButtonContainer>
        </Form>
      </Container>
    </Wrapper>
  );
} 