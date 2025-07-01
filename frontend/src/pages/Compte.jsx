import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { useTheme } from '../theme/ThemeContext';

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: transparent;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20vh;
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
`;

const RetourBtn = styled.a`
  display: block;
  margin: 1.5rem auto 0 auto;
  background: ${props => props.theme.containerBg};
  color: ${props => props.theme.text};
  border: 2.5px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
  padding: 0.8rem 2.2rem;
  font-size: 1.08rem;
  font-weight: 700;
  box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  z-index: 3;
  position: relative;
  text-align: center;
  
  &:hover {
    transform: translateY(-3px) scale(1.06) rotate(-1deg);
    background: ${props => props.theme.buttonHoverBg};
    box-shadow: 8px 8px 0 ${props => props.theme.containerBorder};
  }
`;

const DeleteLink = styled.span`
  display: block;
  text-align: center;
  margin-top: 1.5rem;
  color: ${props => props.theme.text};
  opacity: 0.7;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #ff6b6b;
    opacity: 1;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.containerBg};
  color: ${props => props.theme.text};
  padding: 2rem;
  border-radius: 8px;
  border: 3px solid ${props => props.theme.containerBorder};
  box-shadow: 8px 8px 0 ${props => props.theme.containerBorder};
  text-align: center;
  max-width: 400px;
  width: 90%;
  transition: all 0.3s ease;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ModalButton = styled.button`
  padding: 0.8rem 1.5rem;
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &.confirm {
    background: #ff6b6b;
    color: white;
    &:hover {
      background: #ff5252;
    }
  }

  &.cancel {
    background: ${props => props.theme.containerBg};
    color: ${props => props.theme.text};
    &:hover {
      background: ${props => props.theme.buttonHoverBg};
    }
  }
`;

const ProfilSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid ${props => props.theme.containerBorder};

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
`;

const ProfilImage = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${props => props.theme.containerBorder};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  border: 3px solid ${props => props.theme.containerBorder};
  box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  &:hover .profile-overlay {
    opacity: 1;
    visibility: visible;
  }

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    font-size: 2rem;
  }
`;

const ProfileOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  color: white;
  font-size: 2rem;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  color: ${props => props.theme.text};
`;

export default function Compte() {
  const [user, setUser] = useState(null);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [adresseLigne1, setAdresseLigne1] = useState('');
  const [adresseLigne2, setAdresseLigne2] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [ville, setVille] = useState('');
  const [telephone, setTelephone] = useState('');
  const [stats, setStats] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchUser = () => {
      fetch('http://localhost:5000/api/user', {
        credentials: 'include'
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Non connecté');
        })
        .then(data => {
          setUser(data);
          if (data && !data.username) {
            navigate('/creation-username');
            return;
          }
          setNom(data.nom || '');
          setPrenom(data.prenom || '');
          setAdresseLigne1(data.adresseLigne1 || '');
          setAdresseLigne2(data.adresseLigne2 || '');
          setCodePostal(data.codePostal || '');
          setVille(data.ville || '');
          setTelephone(data.telephone || '');
        })
        .catch(() => setUser(null));
    };
    fetchUser();
    window.addEventListener('userStateChanged', fetchUser);
    return () => window.removeEventListener('userStateChanged', fetchUser);
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetch('http://localhost:5000/api/user/bibliotheque/stats', {
        credentials: 'include'
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => setStats(data));
    }
  }, [user]);

  const handleLogout = () => {
    fetch('http://localhost:5000/logout', {
      method: 'POST',
      credentials: 'include'
    })
      .then(() => {
        window.dispatchEvent(new Event('userStateChanged'));
        setUser(null);
        navigate('/');
      });
  };

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
        setEditMode(false);
        setNom(data.nom);
        setPrenom(data.prenom);
        setAdresseLigne1(data.adresseLigne1);
        setAdresseLigne2(data.adresseLigne2);
        setCodePostal(data.codePostal);
        setVille(data.ville);
        setTelephone(data.telephone);
      })
      .catch(() => setMessage("Erreur lors de la mise à jour"));
  };

  const handleDeleteAccount = () => {
    fetch('http://localhost:5000/api/user', {
      method: 'DELETE',
      credentials: 'include'
    })
      .then(res => {
        if (res.ok) {
          window.dispatchEvent(new Event('userStateChanged'));
          navigate('/');
        } else {
          setMessage("Erreur lors de la suppression du compte");
        }
      })
      .catch(() => setMessage("Erreur lors de la suppression du compte"));
  };

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le format du fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Seuls les fichiers JPG et PNG sont autorisés.');
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Taille maximale : 5MB.');
      return;
    }

    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const response = await fetch('http://localhost:5000/api/user/profile-photo', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        // Réinitialiser l'input file
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setMessage('Photo de profil mise à jour avec succès !');
      } else {
        throw new Error('Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Erreur upload photo:', error);
      setMessage('Erreur lors du téléchargement de la photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!user) {
    return (
      <Wrapper>
        <div>
          <Container>
            <Titre>Non connecté</Titre>
          </Container>
          <RetourBtn href="/">← Retour à la recherche</RetourBtn>
        </div>
      </Wrapper>
    );
  }

  return (
    <>
      <Logo />
      <Wrapper>
        <Container theme={theme}>
          <ProfilSection theme={theme}>
            <ProfilImage theme={theme} onClick={handlePhotoClick}>
              {user.profilePhotoUrl ? (
                <img src={`http://localhost:5000${user.profilePhotoUrl}`} alt="Photo de profil" />
              ) : (
                '👤'
              )}
              <ProfileOverlay className="profile-overlay">
                {uploadingPhoto ? '⏳' : '+'}
              </ProfileOverlay>
            </ProfilImage>
            <HiddenFileInput
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handlePhotoChange}
            />
            <UserDetails>
              <UserTitle theme={theme}>@{user.username}</UserTitle>
              <Info theme={theme}>
                <strong>Email :</strong> {user.email}
              </Info>
            </UserDetails>
          </ProfilSection>

          {message && (
            <Info theme={theme} style={{ color: message.includes('Erreur') ? '#ff6b6b' : '#4caf50', fontWeight: 'bold' }}>
              {message}
            </Info>
          )}

          <Titre theme={theme}>Mon Compte</Titre>
          {user && (
            <>
              {stats && (
                <Info theme={theme}>
                  <strong>Statistiques :</strong>
                  <br />
                  Livres prêtés : {stats.livresPretees || 0}
                  <br />
                  Livres empruntés : {stats.livresEmpruntes || 0}
                  <br />
                  Livres mis en prêt : {stats.livresMisEnPret || 0}
                </Info>
              )}
              <Button onClick={() => navigate('/modifier-infos')}>
                Modifier mes infos
              </Button>
              <Button onClick={handleLogout}>
                Se déconnecter
              </Button>
              <RetourBtn theme={theme} href="/">
                ← Retour à la recherche
              </RetourBtn>
              <DeleteLink theme={theme} onClick={() => setShowDeleteModal(true)}>
                Supprimer mon compte
              </DeleteLink>
            </>
          )}
        </Container>
      </Wrapper>

      {showDeleteModal && (
        <Modal>
          <ModalContent theme={theme}>
            <h2>Êtes-vous sûr ?</h2>
            <p>Cette action est irréversible. Toutes vos données seront supprimées.</p>
            <ModalButtons>
              <ModalButton
                theme={theme}
                className="cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </ModalButton>
              <ModalButton
                theme={theme}
                className="confirm"
                onClick={handleDeleteAccount}
              >
                Supprimer
              </ModalButton>
            </ModalButtons>
          </ModalContent>
        </Modal>
      )}
    </>
  );
} 