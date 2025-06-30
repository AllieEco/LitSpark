import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import Button from '../components/Button';
import Logo from '../components/Logo';

const PageContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f7fa 0%, #f1f8e9 100%);
  position: relative;
  z-index: 10;
  padding-top: 20vh;
`;

const Card = styled.div`
  width: 100%;
  max-width: 700px;
  background: #faf8f5;
  border: 3px solid #181818;
  border-radius: 18px;
  box-shadow: 8px 8px 0 #181818;
  padding: 2.2rem 1.5rem 1.5rem 1.5rem;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 20;
  @media (max-width: 800px) {
    padding: 1.2rem 0.5rem 1rem 0.5rem;
    box-shadow: 4px 4px 0 #181818;
  }
  @media (max-width: 500px) {
    max-width: 98vw;
    padding: 1rem 0.2rem 0.7rem 0.2rem;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  letter-spacing: -1px;
  color: #181818;
  text-shadow: 1px 1px 0 #181818;
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
  border: 2px solid #181818;
  border-radius: 8px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #1565c0;
  }
`;

const ErrorMessage = styled.p`
  color: #d32f2f;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
`;

export default function CreationUsername() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateUsername = (value) => {
    if (value.length < 3) {
      return "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }
    if (value.length > 20) {
      return "Le nom d'utilisateur ne peut pas dépasser 20 caractères";
    }
    if (/\s/.test(value)) {
      return "Le nom d'utilisateur ne peut pas contenir d'espaces";
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres, des tirets et des underscores";
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/users/username', { username }, {
        withCredentials: true
      });
      navigate('/compte');
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 409) {
        setError("Ce nom d'utilisateur est déjà pris");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Logo />
      <PageContainer>
        <Card>
          <Title>Choisissez votre nom d'utilisateur</Title>
          <Form onSubmit={handleSubmit}>
            <Input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Nom d'utilisateur"
              disabled={isLoading}
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <Button type="submit" disabled={isLoading || !username}>
              {isLoading ? 'Validation...' : 'Valider'}
            </Button>
          </Form>
        </Card>
      </PageContainer>
    </>
  );
} 