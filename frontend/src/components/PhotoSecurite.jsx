import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useTheme } from '../theme/ThemeContext';

const Container = styled.div`
  background: ${props => props.theme.containerBg};
  border: 3px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  box-shadow: 8px 8px 0 ${props => props.theme.containerBorder};
  padding: 2rem;
  margin: 2rem 0;
`;

const Title = styled.h2`
  color: ${props => props.theme.text};
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const SubTitle = styled.h3`
  color: ${props => props.theme.text};
  font-size: 1.2rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PageInfo = styled.div`
  background: ${props => props.theme.inputBg};
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 2rem;
  text-align: center;
  color: ${props => props.theme.text};
  font-weight: 600;
`;

const PhotoStep = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  background: ${props => props.theme.inputBg};
`;

const PhotoTitle = styled.h4`
  color: ${props => props.theme.text};
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const VideoContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
  text-align: center;
`;

const Video = styled.video`
  width: 100%;
  max-width: 400px;
  height: 300px;
  object-fit: cover;
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
`;

const Canvas = styled.canvas`
  display: none;
`;

const PhotoPreview = styled.div`
  margin-top: 1rem;
  
  img {
    width: 100%;
    max-width: 200px;
    height: 150px;
    object-fit: cover;
    border: 2px solid ${props => props.theme.containerBorder};
    border-radius: 6px;
  }
`;

const Button = styled.button`
  background: ${props => props.disabled ? '#ccc' : props.theme.containerBg};
  color: ${props => props.disabled ? '#666' : props.theme.text};
  border: 2.5px solid ${props => props.disabled ? '#999' : props.theme.containerBorder};
  border-radius: 6px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  box-shadow: ${props => props.disabled ? 'none' : `4px 4px 0 ${props.theme.containerBorder}`};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  margin: 0.5rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: ${props => props.theme.buttonHoverBg};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.theme.inputBg};
  border-radius: 4px;
  margin-bottom: 2rem;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  background: #4CAF50;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

const SuccessMessage = styled.div`
  background: #4CAF50;
  color: white;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
  margin-top: 1rem;
`;

const PhotoSecurite = ({ 
  bookId, 
  pageAleatoire, 
  type, // 'remise' ou 'retour'
  userRole, // 'proprietaire' ou 'emprunteur'
  onComplete 
}) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [photos, setPhotos] = useState({
    couverture1: null,
    couverture2: null,
    pageAleatoire: null
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const photoSteps = [
    { key: 'couverture1', title: '📕 1ère de couverture', description: 'Photographiez la première de couverture du livre' },
    { key: 'couverture2', title: '📗 2ème de couverture', description: 'Photographiez la dernière de couverture (dos du livre)' },
    { key: 'pageAleatoire', title: `📄 Page ${pageAleatoire}`, description: `Photographiez la page ${pageAleatoire} du livre` }
  ];

  const startCamera = useCallback(async () => {
    try {
      // Vérifier que l'API est disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('API caméra non supportée par ce navigateur');
      }

      console.log('🎥 Demande d\'accès à la caméra...');
      
      // Essayer d'abord avec la caméra arrière
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment', // Caméra arrière
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        console.log('✅ Caméra arrière activée');
      } catch (envError) {
        console.log('⚠️ Caméra arrière non disponible, essai caméra frontale...');
        // Si la caméra arrière ne marche pas, essayer la frontale
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user', // Caméra frontale
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        console.log('✅ Caméra frontale activée');
      }
      
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        console.log('✅ Flux vidéo assigné au composant');
      } else {
        throw new Error('Impossible d\'assigner le flux vidéo');
      }
    } catch (error) {
      console.error('❌ Erreur accès caméra:', error);
      
      let errorMessage = 'Impossible d\'accéder à la caméra.\n\n';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += '🚫 Accès refusé. Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += '📷 Aucune caméra trouvée sur cet appareil.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += '🌐 Votre navigateur ne supporte pas l\'accès à la caméra.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += '⚠️ La caméra est utilisée par une autre application.';
      } else {
        errorMessage += `❗ Erreur technique: ${error.message}`;
      }
      
      errorMessage += '\n\n💡 Conseils:\n';
      errorMessage += '• Vérifiez que vous êtes sur HTTPS (requis pour la caméra)\n';
      errorMessage += '• Fermez les autres applications utilisant la caméra\n';
      errorMessage += '• Rechargez la page et réessayez\n';
      errorMessage += '• Vérifiez les paramètres de confidentialité de votre navigateur';
      
      alert(errorMessage);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('❌ Références vidéo ou canvas manquantes');
      alert('Erreur: Impossible de capturer la photo. Veuillez redémarrer la caméra.');
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Vérifier que la vidéo est bien chargée
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('❌ Vidéo non initialisée');
      alert('La caméra n\'est pas encore prête. Attendez quelques secondes et réessayez.');
      return;
    }
    
    console.log('📸 Capture de la photo...');
    
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('❌ Échec de création du blob');
        alert('Erreur lors de la capture. Veuillez réessayer.');
        return;
      }
      
      const photoUrl = URL.createObjectURL(blob);
      const currentPhotoKey = photoSteps[currentStep].key;
      
      console.log(`✅ Photo capturée pour ${currentPhotoKey}`);
      
      setPhotos(prev => ({
        ...prev,
        [currentPhotoKey]: { blob, url: photoUrl }
      }));
    }, 'image/jpeg', 0.8);
  }, [currentStep, photoSteps]);

  const retakePhoto = useCallback(() => {
    const currentPhotoKey = photoSteps[currentStep].key;
    if (photos[currentPhotoKey]?.url) {
      URL.revokeObjectURL(photos[currentPhotoKey].url);
    }
    
    setPhotos(prev => ({
      ...prev,
      [currentPhotoKey]: null
    }));
  }, [currentStep, photoSteps, photos]);

  const nextStep = useCallback(() => {
    if (currentStep < photoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      stopCamera();
      uploadPhotos();
    }
  }, [currentStep, photoSteps.length, stopCamera]);

  const uploadPhotos = async () => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('couverture1', photos.couverture1.blob, 'couverture1.jpg');
      formData.append('couverture2', photos.couverture2.blob, 'couverture2.jpg');
      formData.append('pageAleatoire', photos.pageAleatoire.blob, 'pageAleatoire.jpg');
      formData.append('type', type);
      formData.append('userRole', userRole);
      
      const response = await fetch(`/api/livres/${bookId}/photos-securite`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCompleted(true);
        setTimeout(() => {
          onComplete && onComplete(data);
        }, 2000);
      } else {
        throw new Error(data.message || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'envoi des photos: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const progress = ((currentStep + (photos[photoSteps[currentStep]?.key] ? 1 : 0)) / photoSteps.length) * 100;

  if (completed) {
    return (
      <Container theme={theme}>
        <SuccessMessage>
          ✅ Photos de sécurité envoyées avec succès !
          <br />
          {type === 'remise' ? 'Remise de l\'ouvrage en cours...' : 'Retour de l\'ouvrage en cours...'}
        </SuccessMessage>
      </Container>
    );
  }

  return (
    <Container theme={theme}>
      <Title theme={theme}>
        🔒 Système de sécurité - Photos obligatoires
      </Title>
      
      <PageInfo theme={theme}>
        📄 Page aléatoire sélectionnée : <strong>Page {pageAleatoire}</strong>
        <br />
        <small>Cette page doit être identique pour le prêteur et l'emprunteur</small>
      </PageInfo>

      {/* Message d'information technique */}
      <div style={{
        background: '#E3F2FD',
        border: '2px solid #2196F3',
        borderRadius: '6px',
        padding: '1rem',
        marginBottom: '1.5rem',
        fontSize: '0.9rem',
        color: '#1565C0'
      }}>
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600' }}>
          ℹ️ Prérequis techniques :
        </p>
        <ul style={{ margin: '0', paddingLeft: '1.2rem', lineHeight: '1.4' }}>
          <li>Connexion sécurisée requise (HTTPS)</li>
          <li>Autorisation d'accès à la caméra nécessaire</li>
          <li>Navigateur moderne supportant WebRTC</li>
          <li>Caméra fonctionnelle sur l'appareil</li>
        </ul>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', fontStyle: 'italic' }}>
          Si la caméra ne s'ouvre pas, vérifiez ces éléments et rechargez la page.
        </p>
      </div>

      <ProgressBar theme={theme}>
        <Progress progress={progress} />
      </ProgressBar>

      <PhotoStep theme={theme}>
        <PhotoTitle theme={theme}>
          {photoSteps[currentStep].title}
        </PhotoTitle>
        <p style={{ color: theme.text, marginBottom: '1rem' }}>
          {photoSteps[currentStep].description}
        </p>

        <VideoContainer>
          {!isStreaming ? (
            <Button onClick={startCamera} theme={theme}>
              📷 Démarrer la caméra
            </Button>
          ) : (
            <>
              <Video ref={videoRef} autoPlay playsInline />
              <Canvas ref={canvasRef} />
              
              <ButtonContainer>
                <Button onClick={capturePhoto} theme={theme}>
                  📸 Prendre la photo
                </Button>
                <Button onClick={stopCamera} theme={theme}>
                  ❌ Arrêter la caméra
                </Button>
              </ButtonContainer>
            </>
          )}
        </VideoContainer>

        {photos[photoSteps[currentStep].key] && (
          <PhotoPreview>
            <p style={{ color: theme.text, marginBottom: '0.5rem' }}>✅ Photo capturée :</p>
            <img src={photos[photoSteps[currentStep].key].url} alt={`Photo ${photoSteps[currentStep].title}`} />
            
            <ButtonContainer>
              <Button onClick={retakePhoto} theme={theme}>
                🔄 Reprendre la photo
              </Button>
              <Button onClick={nextStep} theme={theme} disabled={isUploading}>
                {currentStep < photoSteps.length - 1 ? '➡️ Photo suivante' : 
                 isUploading ? '⏳ Envoi...' : '✅ Terminer'}
              </Button>
            </ButtonContainer>
          </PhotoPreview>
        )}
      </PhotoStep>
    </Container>
  );
};

export default PhotoSecurite; 
