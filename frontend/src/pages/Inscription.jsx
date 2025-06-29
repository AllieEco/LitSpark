import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  padding-top: 15vh;
`;

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

const ErrorMessage = styled.p`
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
`;

function Inscription() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?:{}|<>])[A-Za-z\d!@#$%^&*(),.?:{}|<>]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

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
        // Rediriger vers la connexion Google si l'email est déjà utilisé avec Google
        window.location.href = 'http://localhost:5000/auth/google';
        return;
      }

      // Si l'email n'est pas utilisé avec Google, procéder à l'inscription
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nom: formData.nom,
          prenom: formData.prenom
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      // Redirection vers la page de connexion après inscription réussie
      navigate('/connexion');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Logo />
      <Wrapper>
        <Card theme={theme}>
          <Titre theme={theme}>Inscription</Titre>
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
              type="text"
              name="nom"
              placeholder="Nom"
              value={formData.nom}
              onChange={handleChange}
              required
            />
            <Input
              theme={theme}
              type="text"
              name="prenom"
              placeholder="Prénom"
              value={formData.prenom}
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
            <Input
              theme={theme}
              type="password"
              name="confirmPassword"
              placeholder="Confirmer le mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <Button type="submit">S'inscrire</Button>
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </Form>
          <Button variant="link" onClick={() => navigate('/connexion')}>
            Déjà un compte ? Se connecter
          </Button>
        </Card>
      </Wrapper>
    </>
  );
}

export default Inscription; 