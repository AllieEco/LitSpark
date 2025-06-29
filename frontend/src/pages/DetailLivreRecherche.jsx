import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  padding-top: 12vh;
  padding-bottom: 4vh;
`;

const Container = styled.div`
  max-width: 900px;
  width: 90%;
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

const BookHeader = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const BookImageContainer = styled.div`
  width: 200px;
  height: 280px;
  background: ${props => props.theme.containerBorder}20;
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 150px;
    height: 210px;
    margin: 0 auto;
  }
`;

const BookInfo = styled.div`
  flex: 1;
`;

const BookTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  color: ${props => props.theme.text};
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const BookAuthor = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: ${props => props.theme.text};
  opacity: 0.8;
  font-style: italic;
`;

const AvailabilityBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #4CAF50;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 2rem;
`;

const BookDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const DetailSection = styled.div`
  background: ${props => props.theme.containerBg};
  border: 2px solid ${props => props.theme.containerBorder}30;
  border-radius: 8px;
  padding: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${props => props.theme.text};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DetailsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${props => props.theme.containerBorder}20;

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: ${props => props.theme.text};
  opacity: 0.8;
`;

const DetailValue = styled.span`
  color: ${props => props.theme.text};
  font-weight: 500;
`;

const BookDescription = styled.div`
  margin: 2rem 0;
  padding: 1.5rem;
  background: ${props => props.theme.containerBg};
  border: 2px solid ${props => props.theme.containerBorder}30;
  border-radius: 8px;
`;

const DescriptionText = styled.p`
  color: ${props => props.theme.text};
  line-height: 1.6;
  font-size: 1rem;
  margin: 1rem 0 0 0;
`;

const OwnerSection = styled.div`
  background: linear-gradient(45deg, ${props => props.theme.containerBorder}10, ${props => props.theme.containerBg});
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
  text-align: center;
`;

const OwnerTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${props => props.theme.text};
  margin: 0 0 1rem 0;
`;

const OwnerName = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${props => props.theme.text};
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  padding: 0.5rem;
  margin: -0.5rem -0.5rem 0.5rem -0.5rem;

  &:hover {
    background: ${props => props.theme.containerBorder}20;
    color: ${props => props.theme.text};
    text-decoration: underline;
  }
`;

const OwnerInfo = styled.div`
  font-size: 1rem;
  color: ${props => props.theme.text};
  opacity: 0.8;
  margin-bottom: 1.5rem;
`;

const ContactButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const ContactButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 150px;
`;

const BackButton = styled(Button)`
  background: transparent;
  color: ${props => props.theme.text};
  border: 2px solid ${props => props.theme.containerBorder};
  
  &:hover {
    background: ${props => props.theme.containerBorder}20;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: ${props => props.theme.text};
  font-size: 1.2rem;
  padding: 3rem;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #f44336;
  font-size: 1.2rem;
  padding: 3rem;
`;

export default function DetailLivreRecherche() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [livre, setLivre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = () => {
      fetch('http://localhost:5000/api/user', {
        credentials: 'include'
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Non connecté');
        })
        .then(data => setUser(data))
        .catch(() => setUser(null));
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchLivre = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/livres/details/${id}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setLivre(data);
        } else {
          throw new Error('Livre non trouvé');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLivre();
    }
  }, [id]);

  const handleAction = (action) => {
    if (action === 'message') {
      // Naviguer vers la messagerie avec les infos du livre et du propriétaire
      const bookInfo = {
        bookId: livre._id,
        titre: livre.titre,
        auteur: livre.auteur,
        imageUrl: livre.imageUrl,
        proprietaire: livre.proprietaire?.username || livre.proprietaireNom,
        proprietaireId: livre.proprietaire?._id
      };
      
      console.log('BookInfo créé depuis DetailLivreRecherche:', bookInfo);
      
      navigate('/messagerie', { 
        state: { 
          newMessage: true,
          bookInfo: bookInfo
        } 
      });
    } else if (action === 'reserve') {
      // Fonctionnalité de réservation à implémenter
      alert('Fonctionnalité de réservation en cours de développement');
    }
  };

  const handleOwnerClick = () => {
    const ownerId = livre?.proprietaire?._id;
    if (ownerId) {
      navigate(`/bibliotheque/${ownerId}`);
    }
  };

  if (loading) {
    return (
      <Wrapper>
        <Logo />
        <Container theme={theme}>
          <LoadingMessage theme={theme}>
            📚 Chargement des détails du livre...
          </LoadingMessage>
        </Container>
      </Wrapper>
    );
  }

  if (error || !livre) {
    return (
      <Wrapper>
        <Logo />
        <Container theme={theme}>
          <ErrorMessage>
            😞 Livre non trouvé ou non disponible
          </ErrorMessage>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <BackButton onClick={() => navigate('/recherche')}>
              ← Retour à la recherche
            </BackButton>
          </div>
        </Container>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Logo />
      <Container theme={theme}>
        <BookHeader>
          <BookImageContainer theme={theme}>
            {livre.imageUrl ? (
              <img 
                src={livre.imageUrl} 
                alt={livre.titre}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
              />
            ) : (
              <div style={{ 
                fontSize: '3rem', 
                color: theme.text, 
                opacity: 0.3,
                textAlign: 'center'
              }}>
                📚
              </div>
            )}
          </BookImageContainer>
          
          <BookInfo>
            <BookTitle theme={theme}>{livre.titre}</BookTitle>
            <BookAuthor theme={theme}>par {livre.auteur}</BookAuthor>
            <AvailabilityBadge>
              ✅ Disponible à l'emprunt
            </AvailabilityBadge>
          </BookInfo>
        </BookHeader>

        <BookDetails>
          <DetailSection theme={theme}>
            <SectionTitle theme={theme}>
              📖 Informations du livre
            </SectionTitle>
            <DetailsList>
              {livre.genre && (
                <DetailItem theme={theme}>
                  <DetailLabel theme={theme}>Genre</DetailLabel>
                  <DetailValue theme={theme}>{livre.genre}</DetailValue>
                </DetailItem>
              )}
              {livre.editeur && (
                <DetailItem theme={theme}>
                  <DetailLabel theme={theme}>Éditeur</DetailLabel>
                  <DetailValue theme={theme}>{livre.editeur}</DetailValue>
                </DetailItem>
              )}
              {livre.anneePublication && (
                <DetailItem theme={theme}>
                  <DetailLabel theme={theme}>Année</DetailLabel>
                  <DetailValue theme={theme}>{livre.anneePublication}</DetailValue>
                </DetailItem>
              )}
              {livre.nombrePages && (
                <DetailItem theme={theme}>
                  <DetailLabel theme={theme}>Pages</DetailLabel>
                  <DetailValue theme={theme}>{livre.nombrePages}</DetailValue>
                </DetailItem>
              )}
              {livre.isbn && (
                <DetailItem theme={theme}>
                  <DetailLabel theme={theme}>ISBN</DetailLabel>
                  <DetailValue theme={theme}>{livre.isbn}</DetailValue>
                </DetailItem>
              )}
            </DetailsList>
          </DetailSection>

          <DetailSection theme={theme}>
            <SectionTitle theme={theme}>
              ⭐ État et disponibilité
            </SectionTitle>
            <DetailsList>
              <DetailItem theme={theme}>
                <DetailLabel theme={theme}>État</DetailLabel>
                <DetailValue theme={theme}>{livre.etat || 'Non spécifié'}</DetailValue>
              </DetailItem>
              <DetailItem theme={theme}>
                <DetailLabel theme={theme}>Statut</DetailLabel>
                <DetailValue theme={theme} style={{ color: '#4CAF50', fontWeight: '600' }}>
                  Disponible
                </DetailValue>
              </DetailItem>
              <DetailItem theme={theme}>
                <DetailLabel theme={theme}>Ajouté le</DetailLabel>
                <DetailValue theme={theme}>
                  {new Date(livre.dateAjout).toLocaleDateString('fr-FR')}
                </DetailValue>
              </DetailItem>
            </DetailsList>
          </DetailSection>
        </BookDetails>

        {livre.resume && (
          <BookDescription theme={theme}>
            <SectionTitle theme={theme}>
              📝 Résumé
            </SectionTitle>
            <DescriptionText theme={theme}>
              {livre.resume}
            </DescriptionText>
          </BookDescription>
        )}

        <OwnerSection theme={theme}>
          <OwnerTitle theme={theme}>
            👤 Proposé par
          </OwnerTitle>
          <OwnerName theme={theme} onClick={handleOwnerClick}>
            {livre.proprietaire?.username || livre.proprietaireNom}
          </OwnerName>
          {livre.proprietaire?.ville && (
            <OwnerInfo theme={theme}>
              📍 {livre.proprietaire.ville}
            </OwnerInfo>
          )}
          
          {!user && (
            <div style={{ 
              background: `${theme.containerBorder}20`, 
              border: `1px solid ${theme.containerBorder}40`,
              borderRadius: '6px',
              padding: '1rem',
              margin: '1rem 0',
              textAlign: 'center',
              fontSize: '0.9rem',
              color: theme.text,
              opacity: '0.9'
            }}>
              🔐 <strong>Connectez-vous</strong> pour voir les informations de contact et emprunter ce livre
              <div style={{ marginTop: '0.5rem' }}>
                <Button 
                  onClick={() => navigate('/connexion')}
                  style={{ margin: '0.5rem' }}
                >
                  Se connecter
                </Button>
              </div>
            </div>
          )}
          
          {user && (
            <ContactButtons>
              <ContactButton onClick={() => handleAction('message')}>
                💬 Envoyer un message
              </ContactButton>
              <ContactButton onClick={() => handleAction('reserve')}>
                📋 Réserver
              </ContactButton>
            </ContactButtons>
          )}
        </OwnerSection>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <BackButton theme={theme} onClick={() => navigate('/recherche')}>
            ← Retour à la recherche
          </BackButton>
        </div>
      </Container>
    </Wrapper>
  );
} 