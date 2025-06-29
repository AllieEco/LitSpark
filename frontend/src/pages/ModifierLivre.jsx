import React, { useEffect } from 'react';
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
  max-width: 600px;
  width: 85%;
  background: ${props => props.theme.containerBg};
  border: 3px solid ${props => props.theme.containerBorder};
  border-radius: 12px;
  box-shadow: 8px 8px 0 ${props => props.theme.containerBorder};
  padding: 3rem 2.5rem;
  position: relative;
  z-index: 2;
  text-align: center;

  @media (max-width: 768px) {
    width: 95%;
    padding: 2rem 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 2rem 0;
  color: ${props => props.theme.text};
`;

const Message = styled.p`
  font-size: 1.2rem;
  color: ${props => props.theme.text};
  margin-bottom: 2rem;
  line-height: 1.6;
`;

export default function ModifierLivre() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    // Pour l'instant, on redirige automatiquement vers les détails du livre
    // La fonctionnalité de modification sera ajoutée plus tard
    const timer = setTimeout(() => {
      navigate(`/livre/${id}`);
    }, 2000);

    return () => clearTimeout(timer);
  }, [id, navigate]);

  return (
    <Wrapper>
      <Logo />
      <Container theme={theme}>
        <Title theme={theme}>🚧 Modification en cours de développement</Title>
        <Message theme={theme}>
          La fonctionnalité de modification sera bientôt disponible.
          <br />
          Vous allez être redirigé vers les détails du livre...
        </Message>
        <Button onClick={() => navigate(`/livre/${id}`)}>
          Retour aux détails
        </Button>
      </Container>
    </Wrapper>
  );
} 