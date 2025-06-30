import styled from 'styled-components';
import React from 'react';
import { useTheme } from '../theme/ThemeContext';

const LogoText = styled.h1`
  font-family: 'Satoshi', sans-serif;
  font-weight: 700;
  color: ${props => props.theme.text};
  letter-spacing: -0.5px;
  position: ${props => props.centered ? 'relative' : 'fixed'};
  z-index: 1001;
  margin: 0;
  text-align: ${props => props.centered ? 'center' : 'left'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    
    &::after {
      width: 100%;
      opacity: 0.3;
    }
  }
  
  /* Grande taille (page de recherche) */
  ${props => props.centered && `
    font-size: 3.8rem;
    transform: translateY(-10px);
    margin-bottom: 0.5rem;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 40%;
      height: 2px;
      background: ${props.theme.text};
      opacity: 0.15;
      transition: all 0.3s ease;
    }
    
    @media (max-width: 800px) {
      font-size: 3rem;
      margin-bottom: 0.3rem;
      transform: translateY(-5px);
    }
    
    @media (max-width: 500px) {
      font-size: 2.4rem;
      margin-bottom: 0.2rem;
    }
  `}
  
  /* Petite taille (autres pages) */
  ${props => !props.centered && `
    font-size: 2.2rem;
    top: 1.5rem;
    left: 2rem;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 40%;
      height: 2px;
      background: ${props.theme.text};
      opacity: 0.15;
      transition: all 0.3s ease;
    }
    
    @media (max-width: 800px) {
      font-size: 1.8rem;
      top: 1.2rem;
      left: 1.5rem;
    }
    
    @media (max-width: 500px) {
      font-size: 1.6rem;
      top: 1rem;
      left: 1rem;
    }
  `}
`;

const SubTitle = styled.h2`
  font-family: 'Satoshi', sans-serif;
  font-size: ${props => props.centered ? '1.2rem' : '0'};
  font-weight: 400;
  color: ${props => props.theme.text};
  opacity: 0.7;
  text-align: center;
  margin: 0;
  visibility: ${props => props.centered ? 'visible' : 'hidden'};
  font-style: italic;
  transform: translateY(-10px);
  
  @media (max-width: 800px) {
    font-size: ${props => props.centered ? '1rem' : '0'};
  }
  
  @media (max-width: 500px) {
    font-size: ${props => props.centered ? '0.9rem' : '0'};
  }
`;

const LogoLink = styled.a`
  text-decoration: none;
  color: inherit;
  display: inline-block;
  
  &:hover {
    text-decoration: none;
  }
`;

export default function Logo({ centered = false }) {
  const { theme } = useTheme();
  
  return (
    <LogoLink href="/">
      <LogoText centered={centered} theme={theme}>
        LitSpark.
      </LogoText>
      <SubTitle centered={centered} theme={theme}>
        Prête et emprunte des livres en toute sécurité, et plus rapide que la lumière
      </SubTitle>
    </LogoLink>
  );
} 