import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useTheme } from '../theme/ThemeContext';
import Button from '../components/Button';

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
  transition: all 0.3s ease;
`;

const Titre = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.text};
`;

const Info = styled.div`
  font-size: 1.1rem;
  margin-bottom: 1.2rem;
  color: ${props => props.theme.text};

  b {
    color: ${props => props.theme.text};
  }

  input {
    width: 80%;
    padding: 0.5rem;
    margin-top: 0.3rem;
    border: 2px solid ${props => props.theme.containerBorder};
    border-radius: 6px;
    background: ${props => props.theme.inputBg};
    color: ${props => props.theme.text};
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${props => props.theme.text};
      background: ${props => props.theme.buttonHoverBg};
    }

    &::placeholder {
      color: ${props => props.theme.text};
      opacity: 0.5;
    }
  }
`;

const Message = styled.div`
  margin-top: 1rem;
  padding: 0.8rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  transition: all 0.3s ease;

  &.success {
    background: #4ade80;
    color: #064e3b;
  }

  &.error {
    background: #f87171;
    color: #7f1d1d;
  }
`;

export default function ModifierInfos() {
  const [user, setUser] = useState(null);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [adresseLigne1, setAdresseLigne1] = useState('');
  const [adresseLigne2, setAdresseLigne2] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [ville, setVille] = useState('');
  const [telephone, setTelephone] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    fetch('http://localhost:5000/api/user', {
      credentials: 'include'
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Non connecté');
      })
      .then(data => {
        setUser(data);
        setNom(data.nom || '');
        setPrenom(data.prenom || '');
        setAdresseLigne1(data.adresseLigne1 || '');
        setAdresseLigne2(data.adresseLigne2 || '');
        setCodePostal(data.codePostal || '');
        setVille(data.ville || '');
        setTelephone(data.telephone || '');
      })
      .catch(() => setUser(null));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setMessage('');
    fetch('http://localhost:5000/api/user/infos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ nom, prenom, adresseLigne1, adresseLigne2, codePostal, ville, telephone })
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setMessage('Données sauvegardées.');
        setNom(data.nom);
        setPrenom(data.prenom);
        setAdresseLigne1(data.adresseLigne1);
        setAdresseLigne2(data.adresseLigne2);
        setCodePostal(data.codePostal);
        setVille(data.ville);
        setTelephone(data.telephone);
        setTimeout(() => navigate('/compte'), 1200);
      })
      .catch(() => setMessage("Erreur lors de la mise à jour"));
  };

  if (!user) {
    return (
      <Wrapper>
        <Container theme={theme}>
          <Logo />
          <Titre theme={theme}>Non connecté</Titre>
        </Container>
      </Wrapper>
    );
  }

  return (
    <>
      <Logo />
      <Wrapper>
        <Container theme={theme}>
          <Titre theme={theme}>Modifier mes informations</Titre>
          <form onSubmit={handleSave}>
            <Info theme={theme}>
              <b>Nom :</b>
              <input type="text" value={nom} onChange={e => setNom(e.target.value)} placeholder="Votre nom" />
            </Info>
            <Info theme={theme}>
              <b>Prénom :</b>
              <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Votre prénom" />
            </Info>
            <Info theme={theme}>
              <b>Adresse (ligne 1) :</b>
              <input type="text" value={adresseLigne1} onChange={e => setAdresseLigne1(e.target.value)} placeholder="Numéro et nom de rue" />
            </Info>
            <Info theme={theme}>
              <b>Adresse (ligne 2) :</b>
              <input type="text" value={adresseLigne2} onChange={e => setAdresseLigne2(e.target.value)} placeholder="Complément d'adresse (optionnel)" />
            </Info>
            <Info theme={theme}>
              <b>Code postal :</b>
              <input type="text" value={codePostal} onChange={e => setCodePostal(e.target.value)} placeholder="Code postal" />
            </Info>
            <Info theme={theme}>
              <b>Ville :</b>
              <input type="text" value={ville} onChange={e => setVille(e.target.value)} placeholder="Ville" />
            </Info>
            <Info theme={theme}>
              <b>Téléphone :</b>
              <input type="text" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="Numéro de téléphone" />
            </Info>
            <Button type="submit">Valider</Button>
          </form>
          {message && (
            <Message className={message.includes('Erreur') ? 'error' : 'success'}>
              {message}
            </Message>
          )}
        </Container>
      </Wrapper>
    </>
  );
} 