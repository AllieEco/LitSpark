import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../theme/ThemeContext';

const BookCard = styled.div`
  background: ${props => props.theme.containerBg};
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  gap: 1rem;
  padding: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, 
      ${props => props.theme.containerBorder} 0%, 
      ${props => props.theme.text}20 50%, 
      ${props => props.theme.containerBorder} 100%
    );
  }

  @media (max-width: 600px) {
    flex-direction: column;
    padding: 1rem;
  }
`;

const BookCover = styled.div`
  width: 120px;
  height: 160px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  background: ${props => props.theme.containerBorder}30;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.theme.containerBorder}50;

  @media (max-width: 600px) {
    width: 100px;
    height: 140px;
    align-self: center;
  }
`;

const BookImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${BookCard}:hover & {
    transform: scale(1.02);
  }
`;

const BookPlaceholder = styled.div`
  color: ${props => props.theme.text};
  opacity: 0.3;
  font-size: 2.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;

  @media (max-width: 600px) {
    font-size: 2rem;
  }
`;

const BookContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const BookHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.8rem;
  gap: 1rem;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

const BookInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const BookTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${props => props.theme.text};
  margin: 0 0 0.4rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 600px) {
    font-size: 1.2rem;
  }
`;

const BookAuthor = styled.p`
  font-size: 0.95rem;
  color: ${props => props.theme.text};
  opacity: 0.8;
  margin: 0 0 0.4rem 0;
  font-style: italic;
  font-weight: 500;
`;

const AvailabilityBadge = styled.div`
  background: ${props => 
    props.status === 'disponible' ? '#4CAF50' :
    props.status === 'reserve' ? '#FF9800' :
    props.status === 'prete' ? '#f44336' :
    props.status === 'indisponible' ? '#9E9E9E' : '#4CAF50'
  };
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  align-self: flex-start;

  @media (max-width: 600px) {
    align-self: flex-start;
  }
`;

const BookDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0.8rem 0;
`;

const BookTag = styled.span`
  background: ${props => props.theme.containerBorder}15;
  color: ${props => props.theme.text};
  border: 1px solid ${props => props.theme.containerBorder};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 1;
`;

const BookDescription = styled.p`
  color: ${props => props.theme.text};
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0.8rem 0;
  opacity: 0.8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const BookFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme.containerBorder}30;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const BookOwner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const OwnerName = styled.span`
  font-size: 0.85rem;
  color: ${props => props.theme.text};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
  padding: 0.2rem 0.4rem;
  margin: -0.2rem -0.4rem;

  &:hover {
    background: ${props => props.theme.containerBorder}20;
    color: ${props => props.theme.text};
    text-decoration: underline;
  }
`;

const OwnerLocation = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.text};
  opacity: 0.7;
`;

const ContactHint = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.text};
  opacity: 0.6;
  font-style: italic;

  @media (max-width: 600px) {
    align-self: flex-end;
  }
`;

export default function SearchResultCard({ book, onClick }) {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(book._id);
    }
  };

  const handleOwnerClick = (e) => {
    e.stopPropagation(); // Empêche la propagation du clic vers la carte
    const ownerId = book.proprietaire?._id || book.proprietaireId;
    if (ownerId) {
      navigate(`/bibliotheque/${ownerId}`);
    }
  };

  return (
    <BookCard theme={theme} onClick={handleClick}>
      <BookCover theme={theme}>
        {book.imageUrl ? (
          <BookImage 
            src={book.imageUrl} 
            alt={`Couverture de ${book.titre}`}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <BookPlaceholder theme={theme} style={{ display: book.imageUrl ? 'none' : 'flex' }}>
          📚
          <div style={{ fontSize: '0.7rem', marginTop: '0.5rem' }}>
            Pas de<br/>couverture
          </div>
        </BookPlaceholder>
      </BookCover>

      <BookContent>
        <BookHeader>
          <BookInfo>
            <BookTitle theme={theme}>{book.titre}</BookTitle>
            <BookAuthor theme={theme}>par {book.auteur}</BookAuthor>
          </BookInfo>
          <AvailabilityBadge status={book.statut || 'disponible'}>
            {(book.statut === 'disponible' || !book.statut) && '✅ Disponible'}
            {book.statut === 'reserve' && '⏳ Réservé'}
            {book.statut === 'prete' && '📚 Prêté'}
            {book.statut === 'indisponible' && '❌ Indisponible'}
          </AvailabilityBadge>
        </BookHeader>
        
        <BookDetails>
          {book.genre && <BookTag theme={theme}>📖 {book.genre}</BookTag>}
          {book.editeur && <BookTag theme={theme}>🏢 {book.editeur}</BookTag>}
          {book.anneePublication && <BookTag theme={theme}>📅 {book.anneePublication}</BookTag>}
          {book.etat && <BookTag theme={theme}>⭐ {book.etat}</BookTag>}
          {book.isbn && <BookTag theme={theme}>🔢 ISBN</BookTag>}
        </BookDetails>

        {book.resume && (
          <BookDescription theme={theme}>
            {book.resume}
          </BookDescription>
        )}
        
        <BookFooter theme={theme}>
          <BookOwner>
            <OwnerName theme={theme} onClick={handleOwnerClick}>
              👤 {book.proprietaire?.username || book.proprietaireNom}
            </OwnerName>
            {book.proprietaire?.ville && (
              <OwnerLocation theme={theme}>
                📍 {book.proprietaire.ville}
              </OwnerLocation>
            )}
          </BookOwner>
          <ContactHint theme={theme}>
            Cliquez pour contacter
          </ContactHint>
        </BookFooter>
      </BookContent>
    </BookCard>
  );
} 