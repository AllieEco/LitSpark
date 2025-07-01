import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Logo from '../components/Logo';
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
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: 95%;
    padding: 2rem 1.5rem;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
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

const ProfilImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.theme.containerBorder};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  border: 3px solid ${props => props.theme.containerBorder};
  box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  &:hover .profile-overlay {
    opacity: 1;
    visibility: visible;
  }

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    font-size: 2.5rem;
  }
`;

const ProfileOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  color: white;
  font-size: 2.5rem;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  color: ${props => props.theme.text};

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const UserEmail = styled.p`
  font-size: 1.1rem;
  color: ${props => props.theme.text};
  opacity: 0.8;
  margin: 0;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatCard = styled.div`
  background: ${props => props.theme.containerBg};
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 6px 6px 0 ${props => props.theme.containerBorder};
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${props => props.theme.text};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.theme.text};
  opacity: 0.8;
`;

const StatMessage = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.theme.text};
  opacity: 0.6;
  font-style: italic;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const BookCard = styled.div`
  background: ${props => props.theme.containerBg};
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};
  transition: all 0.2s ease;
  display: flex;
  gap: 1rem;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 6px 6px 0 ${props => props.theme.containerBorder};
  }
`;

const BookCover = styled.div`
  width: 80px;
  height: 120px;
  border-radius: 4px;
  background: ${props => props.theme.containerBorder};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &.no-cover {
    color: ${props => props.theme.text};
    opacity: 0.5;
    font-size: 0.8rem;
    text-align: center;
    padding: 0.5rem;
  }
`;

const BookInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const BookTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: ${props => props.theme.text};
`;

const BookAuthor = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.text};
  opacity: 0.8;
  margin: 0 0 1rem 0;
`;

const BookStatus = styled.span`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  background: ${props => 
    props.status === 'disponible' ? '#4CAF50' :
    props.status === 'reserve' ? '#FF9800' :
    props.status === 'prete' ? '#f44336' :
    props.status === 'indisponible' ? '#9E9E9E' : '#2196f3'
  };
  color: white;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  width: fit-content;
`;

const RetourBtn = styled.a`
  display: block;
  margin: 2rem auto 0 auto;
  background: ${props => props.theme.containerBg};
  color: ${props => props.theme.text};
  border: 2.5px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
  padding: 0.8rem 2.2rem;
  font-size: 1.08rem;
  font-weight: 700;
  box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  z-index: 3;
  position: relative;
  text-align: center;
  width: fit-content;
  
  &:hover {
    transform: translateY(-3px) scale(1.06) rotate(-1deg);
    background: ${props => props.theme.buttonHoverBg};
    box-shadow: 8px 8px 0 ${props => props.theme.containerBorder};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: ${props => props.theme.text};
  opacity: 0.6;
  font-size: 1.1rem;
`;

export default function MaBibliotheque() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    livresEmpruntes: 0,
    livresPretees: 0,
    livresMisEnPret: 0
  });
  const [livres, setLivres] = useState([]);
  const [livresEmpruntes, setLivresEmpruntes] = useState([]);
  const [dernierLivreEmprunte, setDernierLivreEmprunte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

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
          if (data && !data.username) {
            navigate('/creation-username');
            return;
          }
        })
        .catch(() => {
          setUser(null);
          navigate('/connexion');
        });
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      // Récupérer les statistiques
      fetch('http://localhost:5000/api/user/bibliotheque/stats', {
        credentials: 'include'
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setStats(data);
          }
        })
        .catch(err => console.log('Erreur stats:', err));

      // Récupérer les livres de la bibliothèque
      fetch('http://localhost:5000/api/user/bibliotheque', {
        credentials: 'include'
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setLivres(data.livres || []);
            setDernierLivreEmprunte(data.dernierLivreEmprunte || null);
          }
        })
        .catch(err => console.log('Erreur livres:', err));

      // Récupérer les livres empruntés
      fetch('http://localhost:5000/api/user/livres-empruntes', {
        credentials: 'include'
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setLivresEmpruntes(data.livres || []);
          }
        })
        .catch(err => console.log('Erreur livres empruntés:', err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le format du fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Seuls les fichiers JPG et PNG sont autorisés.');
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Taille maximale : 5MB.');
      return;
    }

    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const response = await fetch('http://localhost:5000/api/user/profile-photo', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        // Réinitialiser l'input file
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error('Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Erreur upload photo:', error);
      alert('Erreur lors du téléchargement de la photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <Wrapper>
        <Logo />
        <Container theme={theme}>
          <EmptyState theme={theme}>
            Chargement de votre bibliothèque...
          </EmptyState>
        </Container>
      </Wrapper>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Wrapper>
      <Logo />
      <Container theme={theme}>
        <Header theme={theme}>
          <ProfilImage theme={theme} onClick={handlePhotoClick}>
            {user.profilePhotoUrl ? (
              <img src={`http://localhost:5000${user.profilePhotoUrl}`} alt="Photo de profil" />
            ) : (
              '👤'
            )}
            <ProfileOverlay className="profile-overlay">
              {uploadingPhoto ? '⏳' : '+'}
            </ProfileOverlay>
          </ProfilImage>
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handlePhotoChange}
          />
          <UserInfo>
            <Username theme={theme}>@{user.username}</Username>
            <UserEmail theme={theme}>{user.email}</UserEmail>
          </UserInfo>
        </Header>

        <StatsContainer>
          <StatCard theme={theme}>
            {stats.livresEmpruntes > 0 ? (
              <>
                <StatNumber theme={theme}>{stats.livresEmpruntes}</StatNumber>
                <StatLabel theme={theme}>Livres empruntés</StatLabel>
              </>
            ) : (
              <>
                <StatNumber theme={theme}>0</StatNumber>
                <StatMessage theme={theme}>Aucun livre emprunté</StatMessage>
              </>
            )}
          </StatCard>
          <StatCard theme={theme}>
            {stats.livresPretees > 0 ? (
              <>
                <StatNumber theme={theme}>{stats.livresPretees}</StatNumber>
                <StatLabel theme={theme}>Livres prêtés</StatLabel>
              </>
            ) : (
              <>
                <StatNumber theme={theme}>0</StatNumber>
                <StatMessage theme={theme}>Aucun livre prêté</StatMessage>
              </>
            )}
          </StatCard>
          <StatCard theme={theme}>
            {stats.livresMisEnPret > 0 ? (
              <>
                <StatNumber theme={theme}>{stats.livresMisEnPret}</StatNumber>
                <StatLabel theme={theme}>Livres mis en prêt</StatLabel>
              </>
            ) : (
              <>
                <StatNumber theme={theme}>0</StatNumber>
                <StatMessage theme={theme}>Aucun livre en prêt</StatMessage>
              </>
            )}
          </StatCard>
        </StatsContainer>

        {livresEmpruntes.length > 0 && (
          <>
            <SectionTitle theme={theme}>
              📖 Mes livres empruntés ({livresEmpruntes.length} livres)
            </SectionTitle>
            <BooksGrid>
              {livresEmpruntes.map((livre, index) => (
                <BookCard 
                  key={index} 
                  theme={theme}
                  onClick={() => navigate(`/livre/details/${livre._id}`)}
                >
                  <BookCover theme={theme}>
                    {livre.imageUrl ? (
                      <img src={livre.imageUrl} alt={livre.titre} />
                    ) : (
                      <div className="no-cover">Pas de couverture</div>
                    )}
                  </BookCover>
                  <BookInfo>
                    <div>
                      <BookTitle theme={theme}>{livre.titre}</BookTitle>
                      <BookAuthor theme={theme}>par {livre.auteur}</BookAuthor>
                      <BookAuthor theme={theme}>de @{livre.proprietaire.username}</BookAuthor>
                      {livre.pretActuel && livre.pretActuel.dateFinPrevue && (
                        <BookAuthor theme={theme}>
                          Retour prévu : {new Date(livre.pretActuel.dateFinPrevue).toLocaleDateString('fr-FR')}
                        </BookAuthor>
                      )}
                    </div>
                    <BookStatus status="prete">
                      📚 Emprunté
                    </BookStatus>
                  </BookInfo>
                </BookCard>
              ))}
            </BooksGrid>
          </>
        )}

        {dernierLivreEmprunte && (
          <>
            <SectionTitle theme={theme}>
              📚 Dernier livre mis en prêt
            </SectionTitle>
            <BooksGrid>
              <BookCard 
                theme={theme}
                onClick={() => navigate(`/livre/${dernierLivreEmprunte._id}`)}
              >
                <BookCover theme={theme}>
                  {dernierLivreEmprunte.imageUrl ? (
                    <img src={dernierLivreEmprunte.imageUrl} alt={dernierLivreEmprunte.titre} />
                  ) : (
                    <div className="no-cover">Pas de couverture</div>
                  )}
                </BookCover>
                <BookInfo>
                  <div>
                    <BookTitle theme={theme}>{dernierLivreEmprunte.titre}</BookTitle>
                    <BookAuthor theme={theme}>par {dernierLivreEmprunte.auteur}</BookAuthor>
                  </div>
                  <BookStatus status={dernierLivreEmprunte.statut || 'disponible'}>
                    {dernierLivreEmprunte.statut === 'disponible' && '✅ Disponible'}
                    {dernierLivreEmprunte.statut === 'reserve' && '⏳ Réservé'}
                    {dernierLivreEmprunte.statut === 'prete' && '📚 Prêté'}
                    {dernierLivreEmprunte.statut === 'indisponible' && '❌ Indisponible'}
                    {!dernierLivreEmprunte.statut && '✅ Disponible'}
                  </BookStatus>
                </BookInfo>
              </BookCard>
            </BooksGrid>
          </>
        )}

        <SectionTitle theme={theme}>
          📖 Mes livres en prêt ({livres.length} livres)
        </SectionTitle>
        
        {livres.length > 0 ? (
          <BooksGrid>
            {livres.map((livre, index) => (
              <BookCard 
                key={index} 
                theme={theme}
                onClick={() => navigate(`/livre/${livre._id}`)}
              >
                <BookCover theme={theme}>
                  {livre.imageUrl ? (
                    <img src={livre.imageUrl} alt={livre.titre} />
                  ) : (
                    <div className="no-cover">Pas de couverture</div>
                  )}
                </BookCover>
                <BookInfo>
                  <div>
                    <BookTitle theme={theme}>{livre.titre}</BookTitle>
                    <BookAuthor theme={theme}>par {livre.auteur}</BookAuthor>
                  </div>
                  <BookStatus status={livre.statut || 'disponible'}>
                    {livre.statut === 'disponible' && '✅ Disponible'}
                    {livre.statut === 'reserve' && '⏳ Réservé'}
                    {livre.statut === 'prete' && '📚 Prêté'}
                    {livre.statut === 'indisponible' && '❌ Indisponible'}
                    {!livre.statut && '✅ Disponible'}
                  </BookStatus>
                </BookInfo>
              </BookCard>
            ))}
          </BooksGrid>
        ) : (
          <EmptyState theme={theme}>
            Vous n'avez encore mis aucun livre en prêt. Commencez par ajouter vos premiers livres !
          </EmptyState>
        )}

        <RetourBtn theme={theme} href="/mise-en-pret">
          📚 Mettre un livre en prêt
        </RetourBtn>
      </Container>
    </Wrapper>
  );
}