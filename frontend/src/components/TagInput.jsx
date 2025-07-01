import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  min-height: 32px;
  padding: 0.5rem;
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
  background: ${props => props.theme.inputBg};
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: ${props => props.theme.buttonBg};
  color: ${props => props.theme.buttonText};
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.buttonText};
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

const Input = styled.input`
  border: none;
  background: transparent;
  outline: none;
  color: ${props => props.theme.text};
  font-size: 0.95rem;
  flex: 1;
  min-width: 100px;
  
  &::placeholder {
    color: ${props => props.theme.text};
    opacity: 0.5;
  }
`;

const SuggestionsContainer = styled.div`
  position: relative;
`;

const SuggestionsList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${props => props.theme.containerBg};
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
  max-height: 150px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};
`;

const SuggestionItem = styled.div`
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  color: ${props => props.theme.text};
  font-size: 0.9rem;
  
  &:hover {
    background: ${props => props.theme.buttonHoverBg};
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.theme.containerBorder};
  }
`;

const HelpText = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.text};
  opacity: 0.7;
  margin-top: 0.5rem;
`;

const TagInput = ({ tags = [], onChange, theme, placeholder = "Ajoutez des tags (ex: roman, aventure, jeunesse...)" }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Suggestions de tags populaires
  const popularTags = [
    'roman', 'aventure', 'science-fiction', 'fantasy', 'thriller', 'polar',
    'jeunesse', 'enfants', 'adolescent', 'adulte', 'classique', 'contemporain',
    'biographie', 'histoire', 'philosophie', 'psychologie', 'développement personnel',
    'cuisine', 'art', 'musique', 'voyage', 'nature', 'animaux',
    'humour', 'romance', 'mystère', 'guerre', 'famille', 'amitié'
  ];
  
  const filteredSuggestions = popularTags.filter(tag => 
    tag.toLowerCase().includes(inputValue.toLowerCase()) && 
    !tags.includes(tag.toLowerCase())
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.length > 0 && filteredSuggestions.length > 0);
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue.trim());
    }
  };

  const addTag = (tagValue) => {
    if (tagValue && !tags.includes(tagValue.toLowerCase())) {
      const newTags = [...tags, tagValue.toLowerCase()];
      onChange(newTags);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    onChange(newTags);
  };

  const handleSuggestionClick = (suggestion) => {
    addTag(suggestion);
  };

  return (
    <Container>
      <SuggestionsContainer>
        <TagsContainer theme={theme}>
          {tags.map((tag, index) => (
            <Tag key={index} theme={theme}>
              {tag}
              <RemoveButton
                type="button"
                onClick={() => removeTag(tag)}
                theme={theme}
              >
                ×
              </RemoveButton>
            </Tag>
          ))}
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleInputKeyPress}
            onFocus={() => setShowSuggestions(inputValue.length > 0 && filteredSuggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={tags.length === 0 ? placeholder : "Ajouter un autre tag..."}
            theme={theme}
          />
        </TagsContainer>
        
        {showSuggestions && filteredSuggestions.length > 0 && (
          <SuggestionsList theme={theme}>
            {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
              <SuggestionItem
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                theme={theme}
              >
                {suggestion}
              </SuggestionItem>
            ))}
          </SuggestionsList>
        )}
      </SuggestionsContainer>
      
      <HelpText theme={theme}>
        💡 Ajoutez des mots-clés pour que votre livre soit plus facilement trouvé (genre, thème, public cible, etc.)
      </HelpText>
    </Container>
  );
};

export default TagInput; 