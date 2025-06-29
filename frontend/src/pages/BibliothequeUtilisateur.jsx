import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  padding-top: 12vh;
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

const BackButton = styled.button`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: ${props => props.theme.buttonBg};
  color: ${props => props.theme.buttonText};
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.theme.buttonHoverBg};
    transform: translateY(-1px);
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
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    font-size: 2.5rem;
  }
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

const UserVille = styled.p`
  font-size: 1.1rem;
  color: ${props => props.theme.text};
  opacity: 0.8;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PublicLabel = styled.div`
  display: inline-block;
  background: ${props => props.theme.containerBorder}30;
  color: ${props => props.theme.text};
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid ${props => props.theme.containerBorder};
`;

const OwnerBadge = styled.div`
  position: relative;
  display: inline-flex;
  align-items: baseline;
  cursor: help;
  font-size: 1.8rem;
  line-height: 1;
  margin-left: 0.5rem;
  margin-top: -0.2rem;
  vertical-align: baseline;
  
  &:hover .tooltip {
    visibility: visible;
    opacity: 1;
    transform: translateX(-50%) translateY(-10px);
  }
`;

const Tooltip = styled.div`
  visibility: hidden;
  opacity: 0;
  position: absolute;
  top: -85px;
  left: 50%;
  transform: translateX(-50%) translateY(0);
  background: ${props => props.theme.containerBg};
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  padding: 0.8rem 1rem;
  width: 220px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.4;
  color: ${props => props.theme.text};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 1000;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -8px;
    border-width: 8px;
    border-style: solid;
    border-color: ${props => props.theme.containerBg} transparent transparent transparent;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -10px;
    border-width: 10px;
    border-style: solid;
    border-color: ${props => props.theme.containerBorder} transparent transparent transparent;
  }
`;

const UsernameContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
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
    font-size: 1.5rem;
    flex-direction: column;

    span {
      font-size: 0.6rem;
      margin-top: 0.5rem;
      text-align: center;
    }
  }
`;

const BookInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const BookTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props => props.theme.text};
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
`;

const BookAuthor = styled.p`
  font-size: 0.9rem;
  color: ${props => props.theme.text};
  opacity: 0.8;
  margin: 0 0 0.5rem 0;
  font-style: italic;
`;

const BookGenre = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.text};
  background: ${props => props.theme.containerBorder}20;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  display: inline-block;
`;

const BookStatus = styled.div`
  margin-top: auto;
  font-size: 0.8rem;
  color: ${props => props.available ? '#4CAF50' : '#FF9800'};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: ${props => props.theme.text};
  font-size: 1.2rem;
  padding: 3rem;
  opacity: 0.8;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #FF6B6B;
  font-size: 1.2rem;
  padding: 3rem;
  border: 2px solid #FF6B6B;
  border-radius: 8px;
  background: rgba(255, 107, 107, 0.1);
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: ${props => props.theme.text};
  font-size: 1.1rem;
  padding: 3rem;
  opacity: 0.8;
  font-style: italic;
`;

export default function BibliothequeUtilisateur() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserAndBooks = async () => {
      try {
        setLoading(true);
        setError('');

        // Récupérer les informations de l'utilisateur
        const userResponse = await fetch(`http://localhost:5000/api/users/${userId}`, {
          credentials: 'include'
        });
        if (!userResponse.ok) {
          throw new Error('Utilisateur non trouvé');
        }
        const userData = await userResponse.json();
        setUser(userData);

        // Récupérer les livres de l'utilisateur
        const booksResponse = await fetch(`http://localhost:5000/api/books/user/${userId}`, {
          credentials: 'include'
        });
        if (!booksResponse.ok) {
          throw new Error('Erreur lors du chargement des livres');
        }
        const booksData = await booksResponse.json();
        setBooks(booksData);

      } catch (err) {
        console.error('Erreur:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserAndBooks();
    }
  }, [userId]);

  const handleBookClick = (bookId) => {
    navigate(`/livre/${bookId}`);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Wrapper>
        <Logo />
        <Container theme={theme}>
          <LoadingMessage theme={theme}>
            Chargement de la bibliothèque...
          </LoadingMessage>
        </Container>
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper>
        <Logo />
        <Container theme={theme}>
          <ErrorMessage>
            {error}
          </ErrorMessage>
        </Container>
      </Wrapper>
    );
  }

  const livresDisponibles = books.filter(book => book.disponible);
  const livresEmpruntes = books.filter(book => !book.disponible);

  return (
    <Wrapper>
      <Logo />
      <Container theme={theme}>
        <BackButton theme={theme} onClick={handleBackClick}>
          ← Retour
        </BackButton>

        <Header>
          <ProfilImage theme={theme}>
            {user?.profilePhotoUrl ? (
              <img src={`http://localhost:5000${user.profilePhotoUrl}`} alt="Photo de profil" />
            ) : (
              '👤'
            )}
          </ProfilImage>
          <UserInfo>
            <UsernameContainer>
              <Username theme={theme}>{user?.username}</Username>
              {user?.username === 'LitSpark' && (
                <OwnerBadge>
                  👑
                  <Tooltip className="tooltip" theme={theme}>
                    <strong>Compte officiel</strong>
                    <br />
                    Propriétaire de l'application LitSpark
                  </Tooltip>
                </OwnerBadge>
              )}
            </UsernameContainer>
            {user?.ville && (
              <UserVille theme={theme}>
                📍 {user.ville}
              </UserVille>
            )}
            <PublicLabel theme={theme}>
              🌍 Bibliothèque publique
            </PublicLabel>
          </UserInfo>
        </Header>

        <StatsContainer>
          <StatCard theme={theme}>
            <StatNumber theme={theme}>{user?.livresPrets || 0}</StatNumber>
            <StatLabel theme={theme}>Livres prêtés</StatLabel>
          </StatCard>
          <StatCard theme={theme}>
            <StatNumber theme={theme}>{livresDisponibles.length}</StatNumber>
            <StatLabel theme={theme}>Livres disponibles</StatLabel>
          </StatCard>
          <StatCard theme={theme}>
            <StatNumber theme={theme}>{livresEmpruntes.length}</StatNumber>
            <StatLabel theme={theme}>Livres empruntés</StatLabel>
          </StatCard>
        </StatsContainer>

        {books.length === 0 ? (
          <EmptyMessage theme={theme}>
            Cette bibliothèque ne contient aucun livre pour le moment.
          </EmptyMessage>
        ) : (
          <>
            <SectionTitle theme={theme}>
              📚 Bibliothèque de {user?.username}
            </SectionTitle>
            <BooksGrid>
              {books.map((book) => (
                <BookCard 
                  key={book._id} 
                  theme={theme}
                  onClick={() => handleBookClick(book._id)}
                >
                  <BookCover theme={theme} className={book.imageUrl ? '' : 'no-cover'}>
                    {book.imageUrl ? (
                      <img src={book.imageUrl} alt={`Couverture de ${book.titre}`} />
                    ) : (
                      <>
                        📚
                        <span>Pas de couverture</span>
                      </>
                    )}
                  </BookCover>
                  <BookInfo>
                    <BookTitle theme={theme}>{book.titre}</BookTitle>
                    <BookAuthor theme={theme}>par {book.auteur}</BookAuthor>
                    {book.genre && (
                      <BookGenre theme={theme}>{book.genre}</BookGenre>
                    )}
                    <BookStatus theme={theme} available={book.disponible}>
                      {book.disponible ? (
                        <>✅ Disponible</>
                      ) : (
                        <>📖 Emprunté</>
                      )}
                    </BookStatus>
                  </BookInfo>
                </BookCard>
              ))}
            </BooksGrid>
          </>
        )}
      </Container>
    </Wrapper>
  );
} 