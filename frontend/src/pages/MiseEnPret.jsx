import React, { useState } from 'react';
import styled from 'styled-components';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { useTheme } from '../theme/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: transparent;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 15vh;
`;

const Container = styled.div`
  max-width: 500px;
  background: ${props => props.theme.containerBg};
  border: 3px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  box-shadow: 8px 8px 0 ${props => props.theme.containerBorder};
  padding: 2.5rem 2rem 2rem 2rem;
  position: relative;
  z-index: 2;
`;

const MainTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: ${props => props.theme.text};
  text-align: center;
  line-height: 1.2;
  max-width: 800px;

  span {
    display: block;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
  outline: none;
  margin-bottom: 1.5rem;
  background: ${props => props.theme.inputBg};
  color: ${props => props.theme.text};

  &::placeholder {
    color: ${props => props.theme.text};
    opacity: 0.5;
  }
`;

const Btn = styled.button`
  background: ${props => props.theme.containerBg};
  color: ${props => props.theme.text};
  border: 2.5px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
  padding: 1rem 2.2rem;
  font-size: 1.1rem;
  font-weight: 700;
  box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};
  cursor: pointer;
  transition: transform 0.1s;
  &:hover {
    transform: translateY(2px) scale(1.03);
    background: ${props => props.theme.buttonHoverBg};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const IsbnHelp = styled.div`
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: ${props => props.theme.text};
  text-align: center;
  cursor: help;
  position: relative;
  display: inline-block;

  &:hover {
    color: ${props => props.theme.buttonHoverBg};
  }

  &:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
`;

const Tooltip = styled.div`
  visibility: hidden;
  opacity: 0;
  position: absolute;
  top: 125%;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.theme.containerBg};
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
  padding: 1.5rem;
  width: 320px;
  text-align: left;
  font-size: 0.9rem;
  line-height: 1.4;
  box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};
  transition: all 0.2s ease;
  z-index: 10;

  &::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    margin-left: -12px;
    border-width: 12px;
    border-style: solid;
    border-color: transparent transparent ${props => props.theme.containerBorder} transparent;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    margin-left: -10px;
    border-width: 10px;
    border-style: solid;
    border-color: transparent transparent ${props => props.theme.containerBg} transparent;
  }

  h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: ${props => props.theme.text};
  }

  .definition {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid ${props => props.theme.containerBorder};
    color: ${props => props.theme.text};
    opacity: 0.8;
  }

  .location-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: ${props => props.theme.text};
  }

  .locations {
    background: ${props => props.theme.inputBg};
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;

    ul {
      list-style: none;
      margin: 0;
      padding: 0;

      li {
        margin-bottom: 0.5rem;
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
        color: ${props => props.theme.text};
        opacity: 0.9;

        &:before {
          content: "•";
          color: ${props => props.theme.buttonHoverBg};
        }

        .detail {
          opacity: 0.7;
          font-size: 0.85rem;
        }
      }
    }
  }

  .example {
    font-size: 0.85rem;
    color: ${props => props.theme.text};
    opacity: 0.7;
    font-style: italic;
  }
`;

const SubContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

export default function MiseEnPret() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const handleIsbnClick = () => {
    navigate('/mise-en-pret-isbn');
  };

  const handleNoIsbnClick = () => {
    navigate('/mise-en-pret-sans-isbn');
  };
  
  return (
    <>
      <Logo />
      <Wrapper>
        <SubContainer>
          <MainTitle theme={theme}>
            Je prête un livre facilement
            <span>grâce à son ISBN !</span>
          </MainTitle>
          <IsbnHelp theme={theme}>
            Qu'est-ce qu'un ISBN ?
            <Tooltip className="tooltip" theme={theme}>
              <h3>📖 ISBN - NUMÉRO D'IDENTIFICATION</h3>
              <div className="definition">
                L'ISBN (International Standard Book Number) est un numéro unique qui identifie chaque livre publié dans le monde.
              </div>
              <div className="location-title">
                🔍 OÙ LE TROUVER ?
              </div>
              <div className="locations">
                <ul>
                  <li>Page de copyright <span className="detail">(verso de la page de titre)</span></li>
                  <li>Quatrième de couverture <span className="detail">(dos du livre)</span></li>
                  <li>Au-dessus du code-barres</li>
                  <li>Parfois sur la tranche <span className="detail">du livre</span></li>
                </ul>
              </div>
              <div className="example">
                Format : 978-2-401-08462-9 ou 9782401084629
              </div>
            </Tooltip>
          </IsbnHelp>
        </SubContainer>
        <Container theme={theme}>
          <ButtonContainer>
            <Button onClick={handleIsbnClick}>Mon livre a un ISBN</Button>
            <Button onClick={handleNoIsbnClick}>Mon livre n'a pas d'ISBN</Button>
          </ButtonContainer>
        </Container>
      </Wrapper>
    </>
  );
} 