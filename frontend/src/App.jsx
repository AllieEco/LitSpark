import { Routes, Route, Navigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import Recherche from './pages/Recherche';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import MiseEnPret from './pages/MiseEnPret';
import MiseEnPretISBN from './pages/MiseEnPretISBN';
import MiseEnPretSansISBN from './pages/MiseEnPretSansISBN';
import FondAnime from './components/FondAnime';
import Compte from './pages/Compte';
import MaBibliotheque from './pages/MaBibliotheque';
import BibliothequeUtilisateur from './pages/BibliothequeUtilisateur';
import DetailLivre from './pages/DetailLivre';
import DetailLivreRecherche from './pages/DetailLivreRecherche';
import ModifierLivre from './pages/ModifierLivre';
import Messagerie from './pages/Messagerie';
import HeaderGlobal from './components/HeaderGlobal';
import ModifierInfos from './pages/ModifierInfos';
import CreationUsername from './pages/CreationUsername';
import LoanNotification from './components/LoanNotification';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Inter', Arial, sans-serif;
    background: ${props => props.theme.background};
    color: ${props => props.theme.text};
    min-height: 100vh;
    overflow-x: hidden;
    transition: all 0.3s ease;
  }
`;

function AppContent() {
  const { theme } = useTheme();
  
  return (
    <>
      <GlobalStyle theme={theme} />
      <FondAnime />
      <HeaderGlobal />
      <LoanNotification />
      <Routes>
        <Route path="/" element={<Recherche />} />
        <Route path="/recherche" element={<Recherche />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/mise-en-pret" element={<MiseEnPret />} />
        <Route path="/mise-en-pret-isbn" element={<MiseEnPretISBN />} />
        <Route path="/mise-en-pret-sans-isbn" element={<MiseEnPretSansISBN />} />
        <Route path="/compte" element={<Compte />} />
        <Route path="/ma-bibliotheque" element={<MaBibliotheque />} />
        <Route path="/messagerie" element={<Messagerie />} />
        <Route path="/bibliotheque/:userId" element={<BibliothequeUtilisateur />} />
        <Route path="/livre/:id" element={<DetailLivre />} />
        <Route path="/livre/details/:id" element={<DetailLivreRecherche />} />
        <Route path="/modifier-livre/:id" element={<ModifierLivre />} />
        <Route path="/modifier-infos" element={<ModifierInfos />} />
        <Route path="/creation-username" element={<CreationUsername />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
