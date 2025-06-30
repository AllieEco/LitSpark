import styled from 'styled-components';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import Logo from '../components/Logo';
import SearchResultCard from '../components/SearchResultCard';
import { useTheme } from '../theme/ThemeContext';

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: transparent;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20vh;
  padding-bottom: 4vh;
`;

const MainTitle = styled.h1`
  font-family: 'Satoshi', sans-serif;
  font-size: 3.8rem;
  font-weight: 700;
  color: ${props => props.theme.text};
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
  letter-spacing: -0.5px;
  position: fixed;
  top: 2rem;
  left: 2rem;
  z-index: 3;
  margin: 0;
  text-align: left;

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 40%;
    height: 2px;
    background: ${props => props.theme.text};
    opacity: 0.15;
  }

  @media (max-width: 800px) {
    font-size: 3rem;
    top: 1.5rem;
    left: 1.5rem;
  }

  @media (max-width: 500px) {
    font-size: 2.4rem;
    top: 1rem;
    left: 1rem;
  }
`;

const Container = styled.div`
  width: 90%;
  max-width: 800px;
  background: ${props => props.theme.containerBg};
  border: 3px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  box-shadow: 8px 8px 0 ${props => props.theme.containerBorder};
  padding: 2.2rem 2.5rem 1.5rem 2.5rem;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  margin-top: 2rem;
  
  @media (max-width: 800px) {
    padding: 1.2rem 1.5rem 1rem 1.5rem;
    box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};
  }
  
  @media (max-width: 500px) {
    width: 95%;
    padding: 1rem 1rem 0.7rem 1rem;
  }
`;

const SearchContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
`;

const Titre = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  letter-spacing: -1px;
  color: ${props => props.theme.text};
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
  text-align: center;
`;

const SearchForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  @media (min-width: 600px) {
    flex-direction: row;
    justify-content: center;
  }
`;

const Input = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 0.9rem;
  font-size: 1rem;
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
  outline: none;
  background: ${props => props.theme.inputBg};
  color: ${props => props.theme.text};
  transition: all 0.3s ease;

  &::placeholder {
    color: ${props => props.theme.text};
    opacity: 0.5;
  }

  &:focus {
    background: ${props => props.theme.buttonHoverBg};
    border-color: ${props => props.theme.text};
  }

  @media (min-width: 600px) {
    flex: 1;
    margin-right: 1rem;
  }
`;

const ResultsContainer = styled.div`
  width: 100%;
  margin-top: 2rem;
`;

const ResultsInfo = styled.div`
  margin-bottom: 1.5rem;
  text-align: center;
  color: ${props => props.theme.text};
  font-size: 1rem;
  opacity: 0.8;
`;

const BookGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 700px) {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: ${props => props.theme.text};
  font-size: 1.1rem;
  padding: 2rem;
  opacity: 0.8;
`;

const NoResults = styled.div`
  text-align: center;
  color: ${props => props.theme.text};
  font-size: 1.1rem;
  padding: 2rem;
  opacity: 0.8;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.disabled ? 'transparent' : props.theme.buttonBg};
  color: ${props => props.disabled ? props.theme.text + '50' : props.theme.buttonText};
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.5 : 1};

  &:hover:not(:disabled) {
    background: ${props => props.theme.buttonHoverBg};
    transform: translateY(-1px);
  }
`;

const PageInfo = styled.span`
  color: ${props => props.theme.text};
  font-weight: 600;
`;

export default function Recherche() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
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
        })
        .catch(() => setUser(null));
    };
    fetchUser();
    window.addEventListener('userStateChanged', fetchUser);
    return () => window.removeEventListener('userStateChanged', fetchUser);
  }, []);

  useEffect(() => {
    const queryFromUrl = searchParams.get('q');
    if (queryFromUrl) {
      setSearchQuery(queryFromUrl);
      handleSearch(null, 1, queryFromUrl);
    }
  }, [searchParams]);

  const handleSearch = async (e, page = 1, queryOverride = null) => {
    if (e) e.preventDefault();
    
    const query = queryOverride || searchQuery;
    
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      setSearchParams({});
      return;
    }

    setLoading(true);
    setCurrentPage(page);

    if (page === 1) {
      setSearchParams({ q: query });
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/livres/recherche?q=${encodeURIComponent(query)}&page=${page}&limit=6`,
        {
          credentials: 'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.livres);
        setTotalPages(data.totalPages);
        setTotalResults(data.total);
        setHasSearched(true);
      } else {
        throw new Error('Erreur de recherche');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (bookId) => {
    window.location.href = `/livre/details/${bookId}`;
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      handleSearch(null, page);
    }
  };

  return (
    <Wrapper>
      <Logo centered={true} />
      <Container theme={theme}>
        <SearchContainer>
          <Titre theme={theme}>Rechercher un livre à emprunter 📚</Titre>
          {!user && (
            <div style={{ 
              background: `${theme.containerBorder}20`, 
              border: `1px solid ${theme.containerBorder}40`,
              borderRadius: '6px',
              padding: '0.8rem 1rem',
              marginBottom: '1rem',
              textAlign: 'center',
              fontSize: '0.9rem',
              color: theme.text,
              opacity: '0.8'
            }}>
              💡 Vous pouvez rechercher sans être connecté, mais vous devrez vous connecter pour emprunter un livre
            </div>
          )}
          <SearchForm onSubmit={handleSearch}>
            <Input 
              theme={theme} 
              placeholder="Titre, auteur, ISBN, genre..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Recherche...' : 'Rechercher'}
            </Button>
          </SearchForm>
        </SearchContainer>

        {hasSearched && (
          <ResultsContainer>
            {loading ? (
              <LoadingMessage theme={theme}>
                🔍 Recherche en cours...
              </LoadingMessage>
            ) : searchResults.length > 0 ? (
              <>
                <ResultsInfo theme={theme}>
                  {totalResults} livre{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''} pour "{searchQuery}"
                </ResultsInfo>
                <BookGrid>
                  {searchResults.map((book) => (
                    <SearchResultCard 
                      key={book._id} 
                      book={book}
                      onClick={handleBookClick}
                    />
                  ))}
                </BookGrid>

                {totalPages > 1 && (
                  <PaginationContainer>
                    <PaginationButton 
                      theme={theme}
                      disabled={currentPage === 1}
                      onClick={() => goToPage(currentPage - 1)}
                    >
                      ← Précédent
                    </PaginationButton>
                    
                    <PageInfo theme={theme}>
                      Page {currentPage} sur {totalPages}
                    </PageInfo>
                    
                    <PaginationButton 
                      theme={theme}
                      disabled={currentPage === totalPages}
                      onClick={() => goToPage(currentPage + 1)}
                    >
                      Suivant →
                    </PaginationButton>
                  </PaginationContainer>
                )}
              </>
            ) : (
              <NoResults theme={theme}>
                😔 Aucun livre trouvé pour "{searchQuery}"
                <br />
                <small>Essayez avec d'autres mots-clés ou un autre genre</small>
              </NoResults>
            )}
          </ResultsContainer>
        )}
      </Container>
    </Wrapper>
  );
} 