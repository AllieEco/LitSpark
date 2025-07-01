import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useTheme } from '../theme/ThemeContext';

const Container = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: ${props => props.theme.containerBg};
  border: 3px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
`;

const Title = styled.h1`
  color: ${props => props.theme.text};
  text-align: center;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  background: ${props => props.theme.containerBg};
  color: ${props => props.theme.text};
  border: 2.5px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin: 0.5rem;
  
  &:hover {
    background: ${props => props.theme.buttonHoverBg};
  }
`;

const Video = styled.video`
  width: 100%;
  max-width: 400px;
  height: 300px;
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
  margin: 1rem 0;
`;

const InfoBox = styled.div`
  background: #E3F2FD;
  border: 2px solid #2196F3;
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
  color: #1565C0;
`;

const LogBox = styled.div`
  background: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
  max-height: 200px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 0.9rem;
`;

export default function TestCamera() {
  const { theme } = useTheme();
  const [isStreaming, setIsStreaming] = useState(false);
  const [logs, setLogs] = useState([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const addLog = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  }, []);

  const startCamera = useCallback(async () => {
    addLog('🎥 Début du test de caméra...');
    
    try {
      // Vérifications préalables
      addLog('🔍 Vérification de la compatibilité navigateur...');
      
      if (!navigator.mediaDevices) {
        throw new Error('navigator.mediaDevices non disponible');
      }
      
      if (!navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia non supporté');
      }
      
      addLog('✅ API mediaDevices disponible');
      
      // Test de détection des caméras
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        addLog(`📹 ${cameras.length} caméra(s) détectée(s)`);
        cameras.forEach((camera, index) => {
          addLog(`  - Caméra ${index + 1}: ${camera.label || 'Sans nom'}`);
        });
      } catch (enumError) {
        addLog('⚠️ Impossible de lister les caméras: ' + enumError.message);
      }
      
      // Essai caméra arrière d'abord
      addLog('📱 Tentative caméra arrière...');
      let stream;
      
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        addLog('✅ Caméra arrière activée');
      } catch (envError) {
        addLog('⚠️ Caméra arrière échouée: ' + envError.message);
        addLog('📱 Tentative caméra frontale...');
        
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        addLog('✅ Caméra frontale activée');
      }
      
      // Attribution du flux vidéo
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        addLog('✅ Flux vidéo assigné au composant');
        
        // Informations sur le flux
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          addLog(`📊 Résolution: ${settings.width}x${settings.height}`);
          addLog(`📊 Framerate: ${settings.frameRate} fps`);
        }
      } else {
        throw new Error('Impossible d\'assigner le flux vidéo');
      }
      
    } catch (error) {
      addLog('❌ Erreur: ' + error.message);
      addLog('❌ Type d\'erreur: ' + error.name);
      
      // Messages d'aide spécifiques
      if (error.name === 'NotAllowedError') {
        addLog('💡 Solution: Autorisez l\'accès à la caméra dans votre navigateur');
      } else if (error.name === 'NotFoundError') {
        addLog('💡 Solution: Vérifiez qu\'une caméra est connectée');
      } else if (error.name === 'NotSupportedError') {
        addLog('💡 Solution: Utilisez un navigateur plus récent (Chrome, Firefox, Safari)');
      } else if (error.name === 'NotReadableError') {
        addLog('💡 Solution: Fermez les autres applications utilisant la caméra');
      }
    }
  }, [addLog]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        addLog('🛑 Track arrêté: ' + track.kind);
      });
      streamRef.current = null;
      setIsStreaming(false);
      addLog('✅ Caméra arrêtée');
    }
  }, [addLog]);

  const testCapture = useCallback(() => {
    if (!videoRef.current) {
      addLog('❌ Référence vidéo manquante');
      return;
    }
    
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      addLog('❌ Vidéo non initialisée');
      return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        addLog(`✅ Photo capturée: ${blob.size} bytes`);
        addLog(`📸 Type: ${blob.type}`);
      } else {
        addLog('❌ Échec de capture');
      }
    }, 'image/jpeg', 0.8);
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <Container theme={theme}>
      <Title theme={theme}>🎥 Test de Caméra - Diagnostic</Title>
      
      <InfoBox>
        <strong>Instructions:</strong>
        <br />
        1. Cliquez sur "Démarrer la caméra"
        <br />
        2. Autorisez l'accès quand le navigateur le demande
        <br />
        3. Regardez les logs pour diagnostiquer les problèmes
      </InfoBox>

      <div style={{ textAlign: 'center' }}>
        {!isStreaming ? (
          <Button onClick={startCamera} theme={theme}>
            📷 Démarrer la caméra
          </Button>
        ) : (
          <>
            <Video ref={videoRef} autoPlay playsInline />
            <br />
            <Button onClick={testCapture} theme={theme}>
              📸 Test capture
            </Button>
            <Button onClick={stopCamera} theme={theme}>
              🛑 Arrêter caméra
            </Button>
          </>
        )}
        
        <Button onClick={clearLogs} theme={theme}>
          🗑️ Effacer logs
        </Button>
      </div>

      <LogBox>
        <strong>Logs de diagnostic:</strong>
        {logs.length === 0 ? (
          <div style={{ fontStyle: 'italic', opacity: 0.7 }}>
            Aucun log pour le moment...
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))
        )}
      </LogBox>
    </Container>
  );
} 
