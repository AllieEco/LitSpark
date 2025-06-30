import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../theme/ThemeContext';

const Header = styled.header`
  width: 100vw;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1.5rem 2rem 2rem 2rem;
  background: ${props => props.theme.background};
  z-index: 1000;
  position: fixed;
  top: 0;
  left: 0;
  opacity: 1;

  @media (max-width: 1200px) {
    padding: 1.5rem 2rem 2rem 2rem;
  }

  @media (max-width: 800px) {
    padding: 1.5rem 2rem 2rem 2rem;
  }

  @media (max-width: 500px) {
    padding: 1.5rem 1.5rem 2rem 1.5rem;
  }
`;

const MenuContainer = styled.div`
  position: relative;
`;

const MenuButton = styled.button`
  background: ${props => props.theme.containerBg};
  color: ${props => props.theme.text};
  border: 2.5px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
  padding: 0.7rem 1.7rem;
  font-size: 1.05rem;
  font-weight: 600;
  box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    transform: translateY(2px) scale(1.03);
    background: ${props => props.theme.buttonHoverBg};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 110%;
  right: 0;
  background: ${props => props.theme.containerBg};
  border: 2.5px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};
  min-width: 200px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MenuItem = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.text};
  font-size: 1.05rem;
  font-weight: 600;
  padding: 1rem 1.5rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: ${props => props.theme.buttonHoverBg};
  }
`;

const ConnexionBtn = styled.a`
  background: ${props => props.theme.containerBg};
  color: ${props => props.theme.text};
  border: 2.5px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
  padding: 0.7rem 1.7rem;
  font-size: 1.05rem;
  font-weight: 600;
  box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  &:hover {
    transform: translateY(2px) scale(1.03);
    background: ${props => props.theme.buttonHoverBg};
  }
`;

const ThemeToggle = styled.button`
  background: ${props => props.theme.containerBg};
  color: ${props => props.theme.text};
  border: 2.5px solid ${props => props.theme.containerBorder};
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};
  aspect-ratio: 1;

  &:hover {
    transform: translateY(2px) scale(1.03);
    background: ${props => props.theme.buttonHoverBg};
  }

  @media (max-width: 500px) {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-right: 10rem;

  @media (max-width: 1200px) {
    margin-right: 6rem;
    gap: 0.8rem;
  }

  @media (max-width: 800px) {
    margin-right: 3rem;
    gap: 0.7rem;
  }

  @media (max-width: 500px) {
    margin-right: 1rem;
    gap: 0.6rem;
  }
`;

const MessageIndicator = styled.span`
  background: #ff4444;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: bold;
  position: absolute;
  top: 8px;
  right: 8px;
  box-shadow: 0 0 0 2px ${props => props.theme.containerBg};
`;

export default function HeaderGlobal() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { theme, isDarkMode, toggleTheme } = useTheme();

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
          if (data) {
            fetchUnreadMessages();
          }
        })
        .catch(() => {
          setUser(null);
          setUnreadMessages(0);
        });
    };
    fetchUser();
    window.addEventListener('userStateChanged', fetchUser);
    return () => window.removeEventListener('userStateChanged', fetchUser);
  }, []);

  const fetchUnreadMessages = () => {
    fetch('http://localhost:5000/api/conversations/unread-count', {
      credentials: 'include'
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Erreur');
      })
      .then(data => setUnreadMessages(data.count || 0))
      .catch(() => setUnreadMessages(0));
  };

  // Actualiser le compteur de messages non lus toutes les 30 secondes
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest('#menu-compte')) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    fetch('http://localhost:5000/logout', {
      method: 'POST',
      credentials: 'include'
    })
      .then(() => {
        window.dispatchEvent(new Event('userStateChanged'));
        setUser(null);
        window.location.href = '/';
      });
  };

  const handleNavigate = (path) => {
    window.location.href = path;
  };

  return (
    <Header>
      {user ? (
        <ButtonGroup>
          <MenuContainer id="menu-compte">
            <MenuButton theme={theme} onClick={() => setMenuOpen((open) => !open)}>
              Mon compte 👤
            </MenuButton>
            {menuOpen && (
              <DropdownMenu theme={theme}>
                <MenuItem theme={theme} onClick={() => handleNavigate('/compte')}>Mes informations</MenuItem>
                <MenuItem theme={theme} onClick={() => handleNavigate('/ma-bibliotheque')}>Ma bibliothèque</MenuItem>
                <MenuItem theme={theme} onClick={() => handleNavigate('/messagerie')} style={{ position: 'relative' }}>
                  Messagerie
                  {unreadMessages > 0 && (
                    <MessageIndicator theme={theme}>
                      {unreadMessages > 99 ? '99+' : unreadMessages}
                    </MessageIndicator>
                  )}
                </MenuItem>
                <MenuItem theme={theme} onClick={() => handleNavigate('/mise-en-pret')}>Je prête un livre</MenuItem>
                <MenuItem theme={theme} onClick={handleLogout}>Déconnexion</MenuItem>
              </DropdownMenu>
            )}
          </MenuContainer>
          <ThemeToggle onClick={toggleTheme} theme={theme}>
            {isDarkMode ? '☀️' : '🌙'}
          </ThemeToggle>
        </ButtonGroup>
      ) : (
        <ButtonGroup>
          <ConnexionBtn theme={theme} href="/connexion">Connexion 🔑</ConnexionBtn>
          <ThemeToggle onClick={toggleTheme} theme={theme}>
            {isDarkMode ? '☀️' : '🌙'}
          </ThemeToggle>
        </ButtonGroup>
      )}
    </Header>
  );
} 