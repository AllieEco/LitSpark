import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  padding-right: 3rem;
  font-size: 1rem;
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 25px;
  outline: none;
  background: ${props => props.theme.containerBg};
  color: ${props => props.theme.text};
  transition: all 0.3s ease;

  &::placeholder {
    color: ${props => props.theme.text};
    opacity: 0.6;
  }

  &:focus {
    border-color: ${props => props.theme.text};
    box-shadow: 0 0 0 3px ${props => props.theme.text}20;
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: ${props => props.theme.buttonBg};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.buttonHoverBg};
    transform: translateY(-50%) scale(1.05);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: translateY(-50%);
  }
`;

const SearchSuggestions = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${props => props.theme.containerBg};
  border: 2px solid ${props => props.theme.containerBorder};
  border-top: none;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
`;

const SuggestionItem = styled.div`
  padding: 0.8rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: ${props => props.theme.text};
  border-bottom: 1px solid ${props => props.theme.containerBorder}30;

  &:hover {
    background: ${props => props.theme.containerBorder}20;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SuggestionTitle = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
`;

const SuggestionSubtitle = styled.div`
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 0.2rem;
`;

export default function QuickSearch({ placeholder = "Rechercher un livre...", onSearch }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/livres/recherche?q=${encodeURIComponent(searchQuery)}&limit=5`,
        { credentials: 'include' }
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.livres || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounce pour éviter trop de requêtes
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/recherche?q=${encodeURIComponent(query)}`);
      }
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (livre) => {
    navigate(`/livre/details/${livre._id}`);
    setShowSuggestions(false);
    setQuery('');
  };

  const handleBlur = () => {
    // Délai pour permettre le clic sur une suggestion
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <SearchContainer>
      <form onSubmit={handleSearch}>
        <SearchInput
          theme={theme}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          onBlur={handleBlur}
        />
        <SearchButton theme={theme} type="submit" disabled={loading}>
          {loading ? '⏳' : '🔍'}
        </SearchButton>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <SearchSuggestions theme={theme}>
          {suggestions.map((livre) => (
            <SuggestionItem
              key={livre._id}
              theme={theme}
              onClick={() => handleSuggestionClick(livre)}
            >
              <SuggestionTitle>{livre.titre}</SuggestionTitle>
              <SuggestionSubtitle>
                par {livre.auteur} • {livre.proprietaire?.username || livre.proprietaireNom}
              </SuggestionSubtitle>
            </SuggestionItem>
          ))}
        </SearchSuggestions>
      )}
    </SearchContainer>
  );
} 