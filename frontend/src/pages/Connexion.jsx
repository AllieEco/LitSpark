import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { useTheme } from '../theme/ThemeContext';
import Notification from '../components/Notification';

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

// Style identique à Container de Recherche.jsx
const Card = styled.div`
  width: 100%;
  max-width: 700px;
  background: ${props => props.theme.containerBg};
  border: 3px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  box-shadow: 8px 8px 0 ${props => props.theme.containerBorder};
  padding: 2.2rem 1.5rem 1.5rem 1.5rem;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  @media (max-width: 800px) {
    padding: 1.2rem 0.5rem 1rem 0.5rem;
    box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};
  }
  @media (max-width: 500px) {
    max-width: 98vw;
    padding: 1rem 0.2rem 0.7rem 0.2rem;
  }
`;

const Titre = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  letter-spacing: -1px;
  color: ${props => props.theme.text};
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
  text-align: center;
`;

const Form = styled.form`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
  font-size: 1rem;
  background: ${props => props.theme.inputBg};
  color: ${props => props.theme.text};
  transition: all 0.3s ease;
  &::placeholder {
    color: ${props => props.theme.text};
    opacity: 0.5;
  }
  &:focus {
    outline: none;
    border-color: ${props => props.theme.text};
    background: ${props => props.theme.buttonHoverBg};
  }
`;

const GoogleIcon = styled.span`
  display: flex;
  align-items: center;
  svg {
    width: 26px;
    height: 26px;
    display: block;
    fill: ${props => props.theme.text};
  }
`;

const Separator = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem 0;
  &::before, &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${props => props.theme.containerBorder};
  }
  span {
    padding: 0 10px;
    color: ${props => props.theme.text};
    opacity: 0.7;
    font-size: 0.9rem;
  }
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
`;

function Connexion() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    fetch('http://localhost:5000/api/user', {
      credentials: 'include'
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Non connecté');
      })
      .then(data => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Vérifier d'abord si l'email est utilisé avec Google
      const checkResponse = await fetch('http://localhost:5000/api/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email })
      });

      const checkData = await checkResponse.json();
      
      if (checkData.isGoogleUser) {
        // Rediriger vers la connexion Google si l'email est utilisé avec Google
        window.location.href = 'http://localhost:5000/auth/google';
        return;
      }

      // Si l'email n'est pas utilisé avec Google, procéder à la connexion classique
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur de connexion');
      }

      // Afficher la notification et rediriger
      setShowNotification(true);
      setTimeout(() => {
        window.location.href = '/compte';
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    const logoutWindow = window.open('https://accounts.google.com/Logout', '_blank', 'width=500,height=600');
    setTimeout(() => {
      if (logoutWindow) logoutWindow.close();
      window.location.href = 'http://localhost:5000/auth/google';
    }, 1500);
  };

  if (user) {
    const prenom = user.displayName || (user.name && user.name.givenName) || user.prenom || 'Utilisateur';
    return (
      <>
        <Logo />
        <Wrapper>
          <Card theme={theme}>
            <Titre theme={theme}>Bonjour {prenom} !</Titre>
            <p>Vous êtes connecté.</p>
          </Card>
        </Wrapper>
      </>
    );
  }

  return (
    <>
      <Logo />
      <Wrapper>
        <Card theme={theme}>
          <Titre theme={theme}>Connexion</Titre>
          <Form onSubmit={handleSubmit}>
            <Input
              theme={theme}
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              theme={theme}
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Button type="submit">Se connecter</Button>
          </Form>
          
          <Separator theme={theme}>
            <span>OU</span>
          </Separator>

          <Button variant="google" onClick={handleGoogleLogin}>
            <GoogleIcon theme={theme}>
              <svg viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </GoogleIcon>
            Continuer avec Google
          </Button>

          <Button variant="link" onClick={() => navigate('/inscription')}>
            Pas encore de compte ? S'inscrire
          </Button>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Card>
      </Wrapper>
      {showNotification && (
        <Notification 
          message="Vous êtes connecté !" 
          onClose={() => setShowNotification(false)} 
        />
      )}
    </>
  );
}

export default Connexion; 