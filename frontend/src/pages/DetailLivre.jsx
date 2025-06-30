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
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid ${props => props.theme.containerBorder};

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
`;

const BookCover = styled.div`
  width: 200px;
  height: 300px;
  border-radius: 8px;
  background: ${props => props.theme.containerBorder};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &.no-cover {
    color: ${props => props.theme.text};
    opacity: 0.5;
    font-size: 1rem;
    text-align: center;
    padding: 1rem;
  }

  @media (max-width: 768px) {
    width: 150px;
    height: 225px;
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
  color: ${props => props.theme.text};
  opacity: 0.8;
  margin: 0 0 1rem 0;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const BookStatus = styled.span`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  background: #2196f3;
  color: white;
  margin-bottom: 1rem;
`;

const DetailsSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: ${props => props.theme.text};
  border-bottom: 2px solid ${props => props.theme.containerBorder};
  padding-bottom: 0.5rem;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const DetailItem = styled.div`
  background: ${props => props.theme.inputBg};
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  padding: 1rem;
`;

const DetailLabel = styled.div`
  font-weight: 600;
  color: ${props => props.theme.text};
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.8;
`;

const DetailValue = styled.div`
  color: ${props => props.theme.text};
  font-size: 1rem;
  word-break: break-word;
`;

const Description = styled.div`
  background: ${props => props.theme.inputBg};
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  
  p {
    color: ${props => props.theme.text};
    line-height: 1.6;
    margin: 0;
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

export default function DetailLivre() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [livre, setLivre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchLivre = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/livres/${id}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setLivre(data);
        } else {
          setError('Livre non trouvé');
        }
      } catch (err) {
        setError('Erreur lors du chargement du livre');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLivre();
    }
  }, [id]);

  const handleSupprimer = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/livres/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          alert('Livre supprimé avec succès !');
          navigate('/ma-bibliotheque');
        } else {
          alert('Erreur lors de la suppression');
        }
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleModifier = () => {
    navigate(`/modifier-livre/${id}`);
  };

  const handleAccepterPret = async () => {
    if (processing) return;

    const confirmation = window.confirm(
      `Accepter la demande d'emprunt de ${livre.demandePret?.demandeur?.username || 'cet utilisateur'} pour "${livre.titre}" ?\n\n` +
      `Le livre sera marqué comme prêté pendant 14 jours par défaut.`
    );

    if (!confirmation) return;

    setProcessing(true);

    try {
      const response = await fetch(`http://localhost:5000/api/livres/${id}/accepter-pret`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ dureeJours: 14 })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Demande acceptée ! Le livre est prêté jusqu'au ${new Date(data.returnDate).toLocaleDateString('fr-FR')}.`);
        
        // Recharger les données du livre
        window.location.reload();
      } else {
        alert(data.message || 'Erreur lors de l\'acceptation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    } finally {
      setProcessing(false);
    }
  };

  const handleRefuserPret = async () => {
    if (processing) return;

    const raison = prompt(
      `Refuser la demande d'emprunt de ${livre.demandePret?.demandeur?.username || 'cet utilisateur'} ?\n\n` +
      `Vous pouvez saisir une raison (optionnel) :`
    );

    if (raison === null) return; // Utilisateur a annulé

    setProcessing(true);

    try {
      const response = await fetch(`http://localhost:5000/api/livres/${id}/refuser-pret`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ raison: raison || undefined })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Demande refusée. Le livre est de nouveau disponible.');
        
        // Recharger les données du livre
        window.location.reload();
      } else {
        alert(data.message || 'Erreur lors du refus');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarquerRetour = async () => {
    if (processing) return;

    const confirmation = window.confirm(
      `Marquer "${livre.titre}" comme retourné par ${livre.pretActuel?.emprunteur?.username || 'l\'emprunteur'} ?\n\n` +
      `Le livre redeviendra disponible pour d'autres emprunts.`
    );

    if (!confirmation) return;

    setProcessing(true);

    try {
      const response = await fetch(`http://localhost:5000/api/livres/${id}/retour`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        alert('Retour confirmé ! Le livre est de nouveau disponible.');
        
        // Recharger les données du livre
        window.location.reload();
      } else {
        alert(data.message || 'Erreur lors de la confirmation du retour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Wrapper>
        <Logo />
        <Container theme={theme}>
          <LoadingState theme={theme}>
            Chargement des détails du livre...
          </LoadingState>
        </Container>
      </Wrapper>
    );
  }

  if (error || !livre) {
    return (
      <Wrapper>
        <Logo />
        <Container theme={theme}>
          <LoadingState theme={theme}>
            {error || 'Livre non trouvé'}
          </LoadingState>
          <ButtonContainer>
            <Button onClick={() => navigate('/ma-bibliotheque')}>
              Retour à ma bibliothèque
            </Button>
          </ButtonContainer>
        </Container>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Logo />
      <Container theme={theme}>
        <Header theme={theme}>
          <BookCover theme={theme}>
            {livre.imageUrl ? (
              <img src={livre.imageUrl} alt={livre.titre} />
            ) : (
              <div className="no-cover">Pas de couverture</div>
            )}
          </BookCover>
          <BookInfo>
            <BookTitle theme={theme}>{livre.titre}</BookTitle>
            <BookAuthor theme={theme}>par {livre.auteur}</BookAuthor>
            <BookStatus style={{
              background: livre.statut === 'disponible' ? '#2196f3' : 
                         livre.statut === 'reserve' ? '#FF9800' : 
                         livre.statut === 'prete' ? '#f44336' : '#9E9E9E'
            }}>
              {livre.statut === 'disponible' && '✅ Disponible'}
              {livre.statut === 'reserve' && '⏳ Demande en attente'}
              {livre.statut === 'prete' && '📚 Actuellement prêté'}
              {livre.statut === 'indisponible' && '❌ Indisponible'}
            </BookStatus>
          </BookInfo>
        </Header>

        <DetailsSection>
          <SectionTitle theme={theme}>Informations du livre</SectionTitle>
          <DetailGrid>
            {livre.isbn && (
              <DetailItem theme={theme}>
                <DetailLabel theme={theme}>ISBN</DetailLabel>
                <DetailValue theme={theme}>{livre.isbn}</DetailValue>
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
                <DetailLabel theme={theme}>Année de publication</DetailLabel>
                <DetailValue theme={theme}>{livre.anneePublication}</DetailValue>
              </DetailItem>
            )}
            {livre.genre && (
              <DetailItem theme={theme}>
                <DetailLabel theme={theme}>Genre</DetailLabel>
                <DetailValue theme={theme}>{livre.genre}</DetailValue>
              </DetailItem>
            )}
            {livre.nombrePages && (
              <DetailItem theme={theme}>
                <DetailLabel theme={theme}>Nombre de pages</DetailLabel>
                <DetailValue theme={theme}>{livre.nombrePages}</DetailValue>
              </DetailItem>
            )}
            <DetailItem theme={theme}>
              <DetailLabel theme={theme}>État</DetailLabel>
              <DetailValue theme={theme}>{livre.etat}</DetailValue>
            </DetailItem>
            <DetailItem theme={theme}>
              <DetailLabel theme={theme}>Date d'ajout</DetailLabel>
              <DetailValue theme={theme}>
                {new Date(livre.dateAjout).toLocaleDateString('fr-FR')}
              </DetailValue>
            </DetailItem>
          </DetailGrid>
        </DetailsSection>

        {livre.resume && (
          <DetailsSection>
            <SectionTitle theme={theme}>Résumé</SectionTitle>
            <Description theme={theme}>
              <p>{livre.resume}</p>
            </Description>
          </DetailsSection>
        )}

        {/* Section pour les demandes de prêt et prêts en cours */}
        {livre.statut === 'reserve' && livre.demandePret && (
          <DetailsSection>
            <SectionTitle theme={theme} style={{ color: '#FF9800' }}>
              📋 Demande de prêt en attente
            </SectionTitle>
            <Description theme={theme} style={{ background: '#FFF3E0', border: '2px solid #FF9800' }}>
              <p>
                <strong>Demandeur :</strong> {livre.demandePret.demandeur?.username || 'Utilisateur inconnu'}<br/>
                <strong>Date de demande :</strong> {new Date(livre.demandePret.dateDemande).toLocaleDateString('fr-FR', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}<br/>
                <strong>Expire le :</strong> {new Date(livre.demandePret.dateExpiration).toLocaleDateString('fr-FR', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Button 
                  onClick={handleAccepterPret}
                  disabled={processing}
                  style={{ background: '#4CAF50', opacity: processing ? 0.7 : 1 }}
                >
                  {processing ? '⏳ Traitement...' : '✅ Accepter'}
                </Button>
                <Button 
                  onClick={handleRefuserPret}
                  disabled={processing}
                  style={{ background: '#f44336', opacity: processing ? 0.7 : 1 }}
                >
                  {processing ? '⏳ Traitement...' : '❌ Refuser'}
                </Button>
              </div>
            </Description>
          </DetailsSection>
        )}

        {livre.statut === 'prete' && livre.pretActuel && (
          <DetailsSection>
            <SectionTitle theme={theme} style={{ color: '#f44336' }}>
              📚 Actuellement prêté
            </SectionTitle>
            <Description theme={theme} style={{ background: '#FFEBEE', border: '2px solid #f44336' }}>
              <p>
                <strong>Emprunteur :</strong> {livre.pretActuel.emprunteur?.username || 'Utilisateur inconnu'}<br/>
                <strong>Prêté depuis le :</strong> {new Date(livre.pretActuel.dateDebut).toLocaleDateString('fr-FR')}<br/>
                <strong>Retour prévu le :</strong> {new Date(livre.pretActuel.dateFinPrevue).toLocaleDateString('fr-FR')}<br/>
                <strong>Statut :</strong> {
                  new Date(livre.pretActuel.dateFinPrevue) < new Date() 
                    ? '⚠️ En retard' 
                    : '✅ Dans les temps'
                }
              </p>
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Button 
                  onClick={handleMarquerRetour}
                  disabled={processing}
                  style={{ background: '#4CAF50', opacity: processing ? 0.7 : 1 }}
                >
                  {processing ? '⏳ Traitement...' : '📥 Marquer comme retourné'}
                </Button>
              </div>
            </Description>
          </DetailsSection>
        )}

        <ButtonContainer>
          <Button onClick={() => navigate('/ma-bibliotheque')}>
            Retour à ma bibliothèque
          </Button>
          <Button onClick={handleModifier}>
            ✏️ Modifier
          </Button>
          <Button 
            onClick={handleSupprimer}
            style={{ background: '#ff6b6b' }}
          >
            🗑️ Supprimer
          </Button>
        </ButtonContainer>
      </Container>
    </Wrapper>
  );
} 