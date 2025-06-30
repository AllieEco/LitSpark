import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { useTheme } from '../theme/ThemeContext';
import Webcam from 'react-webcam';
import { createWorker } from 'tesseract.js';

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
  width: 90%;
  max-width: 600px;
  background: ${props => props.theme.containerBg};
  border: 3px solid ${props => props.theme.containerBorder};
  border-radius: 8px;
  box-shadow: 8px 8px 0 ${props => props.theme.containerBorder};
  padding: 2.2rem 2.5rem 2rem 2.5rem;
  position: relative;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.text};
  text-align: center;
`;

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  width: 100%;
`;

const SearchInputGroup = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  font-size: 0.95rem;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : props.theme.containerBorder};
  border-radius: 6px;
  background: ${props => props.theme.inputBg};
  color: ${props => props.theme.text};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : props.theme.text};
    background: ${props => props.theme.buttonHoverBg};
  }
`;

const BookForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1rem 0;
`;

const FormContainer = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const CoverContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const ImagePlaceholder = styled.div`
  width: 150px;
  height: 200px;
  border: 2px dashed ${props => props.theme.containerBorder};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
  color: ${props => props.theme.text};
  opacity: 0.7;
  font-size: 0.9rem;
`;

const FileInput = styled.input`
  display: none;
`;

const ImageUploadLabel = styled.label`
  display: inline-block;
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: ${props => props.theme.buttonText};
  background: ${props => props.theme.buttonBg};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.buttonHoverBg};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  width: 100%;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme.text};
  font-size: 0.95rem;
`;

const RequiredLabel = styled(Label)`
  &::after {
    content: ' *';
    color: ${props => props.theme.errorColor};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  font-size: 0.95rem;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : props.theme.containerBorder};
  border-radius: 6px;
  background: ${props => props.theme.inputBg};
  color: ${props => props.theme.text};
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : props.theme.text};
    background: ${props => props.theme.buttonHoverBg};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  font-size: 0.95rem;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : props.theme.containerBorder};
  border-radius: 6px;
  background: ${props => props.theme.inputBg};
  color: ${props => props.theme.text};
  transition: all 0.2s ease;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : props.theme.text};
    background: ${props => props.theme.buttonHoverBg};
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.errorColor};
  font-size: 0.85rem;
  margin-top: 0.4rem;
`;

const FieldError = styled.div`
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
`;

const GuideBox = styled.div`
  font-size: 0.85rem;
  margin-top: 0.75rem;
  color: ${props => props.theme.text};
  opacity: 0.7;
  padding: 0.75rem;
  background: ${props => props.theme.inputBg};
  border-radius: 6px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.75rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.text};
  font-size: 0.95rem;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const PhotosContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-top: 0.75rem;
`;

const PhotoPreview = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid ${props => props.theme.containerBorder};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  button {
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(255, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    
    &:hover {
      background: rgba(255, 0, 0, 0.9);
    }
  }
`;

const SubFormGroup = styled(FormGroup)`
  margin-top: 1.5rem;
  margin-bottom: 0;
`;

const SearchSection = styled.div`
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const CameraModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const CameraContainer = styled.div`
  width: 90%;
  max-width: 600px;
  background: ${props => props.theme.containerBg};
  border-radius: 8px;
  padding: 1rem;
  position: relative;
`;

const CameraContent = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  border-radius: 4px;
  
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CameraOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 1rem;
  text-align: center;
`;

const CameraInstructions = styled.div`
  background: ${props => props.theme.containerBg};
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0.5rem 0;
    
    li {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
      position: relative;
      
      &:before {
        content: "✓";
        position: absolute;
        left: 0;
        color: ${props => props.theme.buttonBg};
      }
    }
  }
`;

const CameraButton = styled(Button)`
  margin-top: 1rem;
`;

const CameraGuide = styled.div`
  background: ${props => props.theme.containerBg};
  border: 2px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
  font-size: 0.9rem;
  color: ${props => props.theme.text};
`;

export default function MiseEnPretISBN() {
  const { theme } = useTheme();
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isbn, setIsbn] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  const [bookData, setBookData] = useState({
    title: '',
    authors: '',
    publisher: '',
    publishedDate: '',
    description: '',
    pageCount: '',
    imageUrl: '',
    language: '',
    loanDuration: '2',
    condition: 'bon',
    conditionNotes: '',
    hasAnnotations: false,
    hasHighlights: false,
    conditionPhotos: []
  });

  const handleIsbnChange = (e) => {
    setIsbn(e.target.value);
  };

  const handleSearch = () => {
    // Nettoyage de l'ISBN
    const cleanedIsbn = isbn.replace(/[-\s]/g, '');
    
    if (!cleanedIsbn || cleanedIsbn.length < 10) {
      setError('Veuillez entrer un ISBN valide (10 ou 13 chiffres)');
      return;
    }

    setLoading(true);
    setError(null);
    setShowForm(false);
    
    // Réinitialisation complète des données
    setBookData({
      title: '',
      authors: '',
      publisher: '',
      publishedDate: '',
      description: '',
      pageCount: '',
      imageUrl: '',
      language: '',
      loanDuration: '2',
      condition: 'bon',
      conditionNotes: '',
      hasAnnotations: false,
      hasHighlights: false,
      conditionPhotos: []
    });

    fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanedIsbn}`)
      .then(res => res.json())
      .then(data => {
        if (data.items && data.items.length > 0) {
          const book = data.items[0].volumeInfo;
          setBookData({
            title: book.title || '',
            authors: book.authors ? book.authors.join(', ') : '',
            publisher: book.publisher || '',
            publishedDate: book.publishedDate || '',
            description: book.description || '',
            pageCount: book.pageCount || '',
            imageUrl: book.imageLinks ? book.imageLinks.thumbnail : '',
            language: book.language || '',
            loanDuration: '2',
            condition: 'bon',
            conditionNotes: '',
            hasAnnotations: false,
            hasHighlights: false,
            conditionPhotos: []
          });
          setShowForm(true);
          setError(null);
        } else {
          setError('Aucun livre trouvé avec cet ISBN');
          setShowForm(false);
        }
      })
      .catch(err => {
        console.error('Erreur lors de la recherche:', err);
        setError('Erreur lors de la recherche. Veuillez réessayer.');
        setShowForm(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedIsbn = isbn.trim().replace(/[-\s]/g, '');
    if (cleanedIsbn && cleanedIsbn.length >= 10) {
      console.log('Lancement de la recherche avec ISBN nettoyé:', cleanedIsbn);
      handleSearch();
    } else {
      alert('Veuillez entrer un ISBN valide (10 ou 13 chiffres)');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérification de la taille du fichier (5MB maximum)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image est trop volumineuse. Taille maximum : 5MB');
        return;
      }

      // Vérification du type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format d\'image non supporté. Utilisez JPG, PNG ou WebP.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Créer une image temporaire pour vérifier les dimensions
        const img = new Image();
        img.onload = () => {
          // Vérifier les dimensions maximales
          if (img.width > 1200 || img.height > 1800) {
            alert('L\'image est trop grande. Dimensions maximales : 1200x1800 pixels');
            return;
          }

          setBookData(prev => ({
            ...prev,
            imageUrl: reader.result
          }));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!bookData.title.trim() || !bookData.authors.trim() || !bookData.pageCount) {
      alert('Veuillez remplir tous les champs obligatoires : titre, auteur(s) et nombre de pages');
      return false;
    }
    return true;
  };

  const handleBookSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) {
      return; // Empêcher la soumission si il y a des erreurs
    }
    
    try {
        const bookDataToSend = {
          isbn: isbn,
          titre: bookData.title,
          auteur: bookData.authors,
          editeur: bookData.publisher || '',
          anneePublication: bookData.publishedDate ? parseInt(bookData.publishedDate) : null,
          nombrePages: bookData.pageCount ? parseInt(bookData.pageCount) : null,
          resume: bookData.description || '',
          etat: (() => {
            switch(bookData.condition) {
              case 'neuf': return 'Excellent';
              case 'excellent': return 'Très bon';
              case 'bon': return 'Bon';
              case 'moyen': return 'Correct';
              case 'usage': return 'Usé';
              default: return 'Bon';
            }
          })(),
          imageUrl: bookData.imageUrl || ''
        };

        const response = await fetch('http://localhost:5000/api/livres', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(bookDataToSend)
        });

        if (response.ok) {
          const result = await response.json();
          alert('Livre ajouté avec succès à votre bibliothèque !');
          // Réinitialiser le formulaire
          setBookData({
            title: '',
            authors: '',
            publisher: '',
            publishedDate: '',
            description: '',
            pageCount: '',
            imageUrl: '',
            language: '',
            loanDuration: '2',
            condition: 'bon',
            conditionNotes: '',
            hasAnnotations: false,
            hasHighlights: false,
            conditionPhotos: []
          });
          setIsbn('');
          setShowForm(false);
          setError(null);
        } else {
          try {
            const result = await response.json();
            console.error('Erreur détaillée:', result);
            alert(`Erreur: ${result.message || 'Erreur inconnue'}`);
          } catch (parseError) {
            console.error('Erreur de parsing:', parseError);
            console.error('Status:', response.status);
            console.error('StatusText:', response.statusText);
            alert(`Erreur HTTP ${response.status}: ${response.statusText}`);
          }
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur de connexion. Veuillez réessayer.');
      }
  };

  const handleInputChange = (e, field) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setBookData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + bookData.conditionPhotos.length > 6) {
      alert('Maximum 6 photos de l\'état du livre');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert('Chaque photo ne doit pas dépasser 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setBookData(prev => ({
          ...prev,
          conditionPhotos: [...prev.conditionPhotos, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setBookData(prev => ({
      ...prev,
      conditionPhotos: prev.conditionPhotos.filter((_, i) => i !== index)
    }));
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérification de la taille du fichier (5MB maximum)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image est trop volumineuse. Taille maximum : 5MB');
        return;
      }

      // Vérification du type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format d\'image non supporté. Utilisez JPG, PNG ou WebP.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Créer une image temporaire pour vérifier les dimensions
        const img = new Image();
        img.onload = () => {
          // Vérifier les dimensions maximales
          if (img.width > 1200 || img.height > 1800) {
            alert('L\'image est trop grande. Dimensions maximales : 1200x1800 pixels');
            return;
          }

          setBookData(prev => ({
            ...prev,
            imageUrl: reader.result
          }));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const extractIsbnFromText = (text) => {
    console.log('Recherche d\'ISBN dans le texte:', text);
    
    // Nettoyer le texte (enlever les caractères parasites)
    const cleanText = text.replace(/[^\d\s-]/g, ' ');
    
    // Expressions régulières pour différents formats d'ISBN
    const isbnPatterns = [
      // ISBN-13 avec tirets : 978-2-123456-78-9
      /978[\s-]?\d[\s-]?\d{6}[\s-]?\d{2}[\s-]?\d/g,
      /979[\s-]?\d[\s-]?\d{6}[\s-]?\d{2}[\s-]?\d/g,
      // ISBN-10 avec tirets : 2-123456-78-9
      /(?<!\d)\d[\s-]?\d{6}[\s-]?\d{2}[\s-]?\d(?!\d)/g,
      // ISBN sans format spécifique (10 ou 13 chiffres consécutifs)
      /(?<!\d)(978|979)?\d{10,13}(?!\d)/g,
      // Format plus flexible pour capturer des ISBN mal formatés
      /(?:\d[\s-]*){9,13}\d/g
    ];
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const pattern of isbnPatterns) {
      const matches = cleanText.match(pattern);
      if (matches) {
        for (const match of matches) {
          const cleanMatch = match.replace(/[\s-]/g, '');
          
          // Vérifier la longueur et donner un score
          let score = 0;
          if (cleanMatch.length === 13 && (cleanMatch.startsWith('978') || cleanMatch.startsWith('979'))) {
            score = 100; // ISBN-13 parfait
          } else if (cleanMatch.length === 10) {
            score = 90; // ISBN-10 parfait
          } else if (cleanMatch.length >= 10 && cleanMatch.length <= 13) {
            score = 70; // Longueur acceptable
          } else {
            continue; // Ignorer les matches trop courts ou trop longs
          }
          
          // Bonus si le match contient des chiffres séquentiels logiques
          if (/^\d+$/.test(cleanMatch)) {
            score += 10;
          }
          
          if (score > bestScore) {
            bestScore = score;
            bestMatch = cleanMatch;
          }
        }
      }
    }
    
    if (bestMatch) {
      console.log('ISBN trouvé:', bestMatch, 'Score:', bestScore);
      
      // Validation finale de l'ISBN
      if (bestMatch.length === 13 && (bestMatch.startsWith('978') || bestMatch.startsWith('979'))) {
        return bestMatch;
      } else if (bestMatch.length === 10) {
        return bestMatch;
      } else if (bestMatch.length >= 10) {
        // Tronquer ou ajuster si nécessaire
        return bestMatch.substring(0, 13);
      }
    }
    
    return null;
  };

  // Fonction de préprocessing d'image pour améliorer l'OCR
  const preprocessImage = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Créer un canvas pour le preprocessing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculer les dimensions optimales (minimum 300 DPI équivalent)
        const minWidth = 1200;
        const scaleFactor = Math.max(1, minWidth / img.width);
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        
        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Obtenir les données de l'image
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // 1. Conversion en niveaux de gris avec amélioration du contraste
        for (let i = 0; i < data.length; i += 4) {
          // Conversion en niveaux de gris avec pondération optimisée pour le texte
          const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          
          // Amélioration du contraste (étirement d'histogramme simplifié)
          let enhancedGray = gray;
          if (gray < 128) {
            enhancedGray = Math.max(0, (gray - 128) * 1.5 + 128);
          } else {
            enhancedGray = Math.min(255, (gray - 128) * 1.5 + 128);
          }
          
          data[i] = enhancedGray;     // Rouge
          data[i + 1] = enhancedGray; // Vert
          data[i + 2] = enhancedGray; // Bleu
          // Alpha reste inchangé
        }
        
        // Appliquer les modifications
        ctx.putImageData(imageData, 0, 0);
        
        // 2. Filtre de netteté (convolution 3x3)
        const sharpenedData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const sharpened = sharpenedData.data;
        const width = canvas.width;
        const height = canvas.height;
        
        // Noyau de netteté
        const kernel = [
          0, -1, 0,
          -1, 5, -1,
          0, -1, 0
        ];
        
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            let sum = 0;
            
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
                const kernelIndex = (ky + 1) * 3 + (kx + 1);
                sum += data[pixelIndex] * kernel[kernelIndex];
              }
            }
            
            const currentIndex = (y * width + x) * 4;
            const clampedValue = Math.max(0, Math.min(255, sum));
            sharpened[currentIndex] = clampedValue;
            sharpened[currentIndex + 1] = clampedValue;
            sharpened[currentIndex + 2] = clampedValue;
          }
        }
        
        ctx.putImageData(sharpenedData, 0, 0);
        
        // 3. Seuillage adaptatif pour binarisation
        const finalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const final = finalData.data;
        
        // Calculer le seuil moyen local
        const blockSize = 15; // Taille du bloc pour seuillage adaptatif
        const C = 10; // Constante soustraite de la moyenne
        
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let sum = 0;
            let count = 0;
            
            // Calculer la moyenne dans un bloc autour du pixel
            for (let by = Math.max(0, y - blockSize); by < Math.min(height, y + blockSize + 1); by++) {
              for (let bx = Math.max(0, x - blockSize); bx < Math.min(width, x + blockSize + 1); bx++) {
                const blockIndex = (by * width + bx) * 4;
                sum += sharpened[blockIndex];
                count++;
              }
            }
            
            const threshold = (sum / count) - C;
            const currentIndex = (y * width + x) * 4;
            const currentValue = sharpened[currentIndex];
            
            // Appliquer le seuillage binaire
            const binaryValue = currentValue > threshold ? 255 : 0;
            final[currentIndex] = binaryValue;
            final[currentIndex + 1] = binaryValue;
            final[currentIndex + 2] = binaryValue;
          }
        }
        
        ctx.putImageData(finalData, 0, 0);
        
        // 4. Appliquer un léger flou gaussien pour réduire le bruit
        ctx.filter = 'blur(0.5px)';
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
        
        // Retourner l'image préprocessée en base64
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.src = imageSrc;
    });
  };

  const processImage = async (imageSrc) => {
    setIsProcessing(true);
    try {
      console.log('Début du preprocessing de l\'image...');
      
      // Préprocessing de l'image pour améliorer l'OCR
      const preprocessedImage = await preprocessImage(imageSrc);
      
      console.log('Preprocessing terminé, début de l\'OCR...');
      
      // Configuration optimisée de Tesseract pour la reconnaissance d'ISBN
      const worker = await createWorker('fra', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`Progression OCR: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      // Configuration des paramètres Tesseract pour optimiser la reconnaissance de texte
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789- ',  // Limiter aux caractères d'ISBN
        tessedit_pageseg_mode: '6',  // Assume uniform block of text
        tessedit_ocr_engine_mode: '1',  // LSTM OCR Engine seulement
      });
      
      const { data: { text, confidence } } = await worker.recognize(preprocessedImage);
      await worker.terminate();
      
      console.log(`Texte reconnu (confiance: ${confidence}%):`, text);
      
      const extractedIsbn = extractIsbnFromText(text);
      if (extractedIsbn) {
        console.log('ISBN extrait:', extractedIsbn);
        setIsbn(extractedIsbn);
        setShowCamera(false);
      } else {
        // Tentative avec moins de restrictions si aucun ISBN n'est trouvé
        console.log('Aucun ISBN trouvé avec les restrictions, nouvelle tentative...');
        
        const fallbackWorker = await createWorker('fra');
        const { data: { text: fallbackText } } = await fallbackWorker.recognize(preprocessedImage);
        await fallbackWorker.terminate();
        
        console.log('Texte de secours:', fallbackText);
        const fallbackIsbn = extractIsbnFromText(fallbackText);
        
        if (fallbackIsbn) {
          console.log('ISBN extrait en secours:', fallbackIsbn);
          setIsbn(fallbackIsbn);
          setShowCamera(false);
        } else {
          alert('Aucun ISBN n\'a été détecté. Conseils :\n• Assurez-vous que l\'ISBN est bien visible\n• Vérifiez l\'éclairage\n• Évitez les reflets\n• Tenez l\'appareil stable');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la reconnaissance de l\'ISBN:', error);
      alert('Une erreur est survenue lors de la reconnaissance de l\'ISBN. Veuillez réessayer.');
    }
    setIsProcessing(false);
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      processImage(imageSrc);
    }
  };

  const handleScanClick = () => {
    setShowCamera(true);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Format de fichier non supporté. Veuillez utiliser une image JPEG, PNG ou WebP.');
      return;
    }

    setIsProcessing(true);
    try {
      // Convertir le fichier en base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target.result;
        try {
          // Utiliser la même fonction processImage pour bénéficier du preprocessing
          await processImage(imageData);
        } catch (error) {
          console.error('Erreur lors de la reconnaissance de l\'ISBN:', error);
          alert('Une erreur est survenue lors de la reconnaissance de l\'ISBN. Veuillez réessayer.');
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erreur lors du chargement du fichier:', error);
      alert('Une erreur est survenue lors du chargement du fichier. Veuillez réessayer.');
      setIsProcessing(false);
    }
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Logo />
      <Wrapper>
        <Container theme={theme}>
          <Title theme={theme}>Mise en prêt avec ISBN</Title>
          <SearchContainer>
            <SearchInputGroup>
              <Input
                theme={theme}
                type="text"
                placeholder="Entrez l'ISBN (10 ou 13 chiffres)"
                value={isbn}
                onChange={handleIsbnChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <Button 
                onClick={handleSearch}
                disabled={loading}
                style={{ minWidth: 'auto' }}
              >
                {loading ? 'Recherche...' : 'Rechercher'}
              </Button>
            </SearchInputGroup>
            <ButtonGroup>
              <Button onClick={handleScanClick}>
                📷 Scanner
              </Button>
              <Button onClick={handleLoadClick} disabled={isProcessing}>
                {isProcessing ? 'Traitement...' : '📁 Charger'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </ButtonGroup>
          </SearchContainer>
          {error && (
            <ErrorMessage theme={theme}>
              {error}
            </ErrorMessage>
          )}

          {showForm && (
            <FormContainer>
              <CoverContainer>
                {bookData.imageUrl ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={bookData.imageUrl}
                      alt="Couverture du livre"
                      style={{
                        width: '150px',
                        height: 'auto',
                        borderRadius: '4px',
                        border: `2px solid ${theme.containerBorder}`
                      }}
                    />
                    <Button
                      onClick={() => setBookData(prev => ({ ...prev, imageUrl: null }))}
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        padding: '4px 8px',
                        minWidth: 'unset',
                        borderRadius: '50%',
                        background: theme.errorColor
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <ImagePlaceholder theme={theme}>
                    Aucune image de couverture disponible
                  </ImagePlaceholder>
                )}
                <FileInput
                  type="file"
                  id="coverUpload"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                />
                <ImageUploadLabel htmlFor="coverUpload" theme={theme}>
                  {bookData.imageUrl ? 'Modifier la couverture' : 'Ajouter une couverture'}
                </ImageUploadLabel>
              </CoverContainer>

              <div>
                <FormGroup>
                  <RequiredLabel theme={theme}>Titre</RequiredLabel>
                  <Input
                    theme={theme}
                    type="text"
                    value={bookData.title}
                    onChange={(e) => handleInputChange(e, 'title')}
                  />
                </FormGroup>

                <FormGroup>
                  <RequiredLabel theme={theme}>Auteur(s)</RequiredLabel>
                  <Input
                    theme={theme}
                    value={bookData.authors}
                    onChange={(e) => handleInputChange(e, 'authors')}
                  />
                </FormGroup>

                <FormGroup>
                  <Label theme={theme}>Éditeur</Label>
                  <Input
                    theme={theme}
                    value={bookData.publisher}
                    onChange={(e) => handleInputChange(e, 'publisher')}
                  />
                </FormGroup>

                <FormGroup>
                  <Label theme={theme}>Date de publication</Label>
                  <Input
                    theme={theme}
                    value={bookData.publishedDate}
                    onChange={(e) => handleInputChange(e, 'publishedDate')}
                  />
                </FormGroup>

                <FormGroup>
                  <Label theme={theme}>Description</Label>
                  <TextArea
                    theme={theme}
                    value={bookData.description}
                    onChange={(e) => handleInputChange(e, 'description')}
                  />
                </FormGroup>

                <FormGroup>
                  <RequiredLabel theme={theme}>Nombre de pages</RequiredLabel>
                  <Input
                    theme={theme}
                    type="number"
                    value={bookData.pageCount}
                    onChange={(e) => handleInputChange(e, 'pageCount')}
                  />
                </FormGroup>

                <FormGroup>
                  <RequiredLabel theme={theme}>Durée de prêt</RequiredLabel>
                  <Select
                    theme={theme}
                    value={bookData.loanDuration}
                    onChange={(e) => handleInputChange(e, 'loanDuration')}
                  >
                    <option value="1">1 semaine</option>
                    <option value="2">2 semaines</option>
                    <option value="3">3 semaines</option>
                    <option value="4">4 semaines</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <RequiredLabel theme={theme}>État du livre</RequiredLabel>
                  <Select
                    theme={theme}
                    value={bookData.condition}
                    onChange={(e) => handleInputChange(e, 'condition')}
                  >
                    <option value="neuf">Neuf</option>
                    <option value="très bon">Très bon</option>
                    <option value="bon">Bon</option>
                    <option value="acceptable">Acceptable</option>
                    <option value="usé">Usé</option>
                  </Select>
                  <GuideBox theme={theme}>
                    • <strong>Neuf</strong> : Jamais utilisé, comme neuf<br />
                    • <strong>Très bon</strong> : Légères traces d'utilisation<br />
                    • <strong>Bon</strong> : Traces d'utilisation normales<br />
                    • <strong>Acceptable</strong> : Usure visible mais bon état général<br />
                    • <strong>Usé</strong> : Traces visibles d'utilisation, pages annotées
                  </GuideBox>

                  <SubFormGroup>
                    <Label theme={theme}>Précisions sur l'état</Label>
                    <TextArea
                      theme={theme}
                      value={bookData.conditionNotes}
                      onChange={(e) => handleInputChange(e, 'conditionNotes')}
                      placeholder="Décrivez l'état du livre plus en détail (optionnel)"
                      rows={3}
                    />
                  </SubFormGroup>

                  <SubFormGroup>
                    <Label theme={theme}>Particularités</Label>
                    <CheckboxContainer>
                      <CheckboxLabel theme={theme}>
                        <Checkbox
                          type="checkbox"
                          checked={bookData.hasAnnotations}
                          onChange={(e) => handleInputChange(e, 'hasAnnotations')}
                        />
                        Contient des annotations manuscrites
                      </CheckboxLabel>
                      <CheckboxLabel theme={theme}>
                        <Checkbox
                          type="checkbox"
                          checked={bookData.hasHighlights}
                          onChange={(e) => handleInputChange(e, 'hasHighlights')}
                        />
                        Contient des passages surlignés
                      </CheckboxLabel>
                    </CheckboxContainer>
                  </SubFormGroup>

                  <SubFormGroup>
                    <Label theme={theme}>Photos de l'état du livre</Label>
                    <PhotosContainer>
                      {bookData.conditionPhotos.map((photo, index) => (
                        <PhotoPreview key={index}>
                          <img
                            src={photo}
                            alt={`État du livre ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <Button
                            onClick={() => removePhoto(index)}
                            style={{
                              position: 'absolute',
                              top: '5px',
                              right: '5px',
                              padding: '4px 8px',
                              minWidth: 'auto'
                            }}
                          >
                            ×
                          </Button>
                        </PhotoPreview>
                      ))}
                    </PhotosContainer>
                    <input
                      type="file"
                      id="photoUpload"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handlePhotoUpload}
                    />
                    <ImageUploadLabel
                      htmlFor="photoUpload"
                      theme={theme}
                      style={{ marginTop: '0.5rem' }}
                    >
                      Ajouter des photos
                    </ImageUploadLabel>
                  </SubFormGroup>
                </FormGroup>



                <ButtonContainer>
                  <Button onClick={handleBookSubmit}>
                    Mettre en prêt
                  </Button>
                </ButtonContainer>
              </div>
            </FormContainer>
          )}
        </Container>
      </Wrapper>
      {showCamera && (
        <CameraModal>
          <CameraContainer theme={theme}>
            <CameraInstructions theme={theme}>
              <h3>Instructions pour la photo :</h3>
              <ul>
                <li>Assurez-vous que l'ISBN est bien visible</li>
                <li>La zone doit être bien éclairée</li>
                <li>Évitez les photos floues</li>
                <li>Tenez l'appareil stable</li>
              </ul>
            </CameraInstructions>
            
            <CameraContent>
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: "environment",
                  aspectRatio: 4/3
                }}
              />
              
              <CameraOverlay>
                <ButtonGroup>
                  <Button onClick={captureImage} disabled={isProcessing}>
                    {isProcessing ? 'Traitement...' : 'Capturer'}
                  </Button>
                  <Button onClick={() => setShowCamera(false)} variant="secondary">
                    Annuler
                  </Button>
                </ButtonGroup>
              </CameraOverlay>
            </CameraContent>
          </CameraContainer>
        </CameraModal>
      )}
    </>
  );
} 