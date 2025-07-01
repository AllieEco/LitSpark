import React, { useState } from 'react';
import styled from 'styled-components';
import Logo from '../components/Logo';
import Button from '../components/Button';
import TagInput from '../components/TagInput';
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  font-size: 0.95rem;
  border: 2px solid ${props => props.hasError ? '#e74c3c' : props.theme.containerBorder};
  border-radius: 6px;
  background: ${props => props.theme.inputBg};
  color: ${props => props.theme.text};
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#e74c3c' : props.theme.text};
    background: ${props => props.theme.buttonHoverBg};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  font-size: 0.95rem;
  border: 2px solid ${props => props.hasError ? '#e74c3c' : props.theme.containerBorder};
  border-radius: 6px;
  background: ${props => props.theme.inputBg};
  color: ${props => props.theme.text};
  transition: all 0.2s ease;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#e74c3c' : props.theme.text};
    background: ${props => props.theme.buttonHoverBg};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
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

export default function MiseEnPretSansISBN() {
  const { theme } = useTheme();
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
    conditionPhotos: [],
    tags: []
  });

  const handleInputChange = (e, field) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setBookData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Effacer l'erreur pour ce champ quand l'utilisateur commence à taper
    if (error && error[field]) {
      setError(prev => {
        if (!prev) return null;
        const newErrors = { ...prev };
        delete newErrors[field];
        return Object.keys(newErrors).length === 0 ? null : newErrors;
      });
    }
  };

  const handleTagsChange = (newTags) => {
    setBookData(prev => ({
      ...prev,
      tags: newTags
    }));
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image est trop volumineuse. Taille maximum : 5MB');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format d\'image non supporté. Utilisez JPG, PNG ou WebP.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
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

  const validateForm = () => {
    const newErrors = {};
    if (!bookData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }
    if (!bookData.authors.trim()) {
      newErrors.authors = 'L\'auteur est obligatoire';
    }
    if (!bookData.pageCount || bookData.pageCount.toString().trim() === '') {
      newErrors.pageCount = 'Le nombre de pages est obligatoire';
    }
    
    setError(Object.keys(newErrors).length === 0 ? null : newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) {
      return; // Empêcher la soumission si il y a des erreurs
    }
    
    try {
        const bookDataToSend = {
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
          imageUrl: bookData.imageUrl || '',
          tags: bookData.tags || []
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
            loanDuration: '2',
            condition: 'bon',
            conditionNotes: '',
            hasAnnotations: false,
            hasHighlights: false,
            hasDamages: false,
            imageUrl: '',
            conditionPhotos: [],
            tags: []
          });
        } else {
          try {
            const result = await response.json();
            alert(`Erreur: ${result.message}`);
          } catch {
            alert(`Erreur HTTP: ${response.status}`);
          }
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur de connexion. Veuillez réessayer.');
      }
  };

  return (
    <>
      <Logo />
      <Wrapper>
        <Container theme={theme}>
          <Title theme={theme}>Mettre un livre en prêt</Title>
          
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
                    onClick={() => setBookData(prev => ({ ...prev, imageUrl: '' }))}
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
                  $hasError={error && error.title}
                  type="text"
                  value={bookData.title}
                  onChange={(e) => handleInputChange(e, 'title')}
                />
                {error && error.title && <FieldError>{error.title}</FieldError>}
              </FormGroup>

              <FormGroup>
                <RequiredLabel theme={theme}>Auteur(s)</RequiredLabel>
                <Input
                  theme={theme}
                  $hasError={error && error.authors}
                  value={bookData.authors}
                  onChange={(e) => handleInputChange(e, 'authors')}
                />
                {error && error.authors && <FieldError>{error.authors}</FieldError>}
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
                <Label theme={theme}>Tags</Label>
                <TagInput
                  tags={bookData.tags}
                  onChange={handleTagsChange}
                  theme={theme}
                />
              </FormGroup>

              <FormGroup>
                <RequiredLabel theme={theme}>Nombre de pages</RequiredLabel>
                <Input
                  theme={theme}
                  $hasError={error && error.pageCount}
                  type="number"
                  value={bookData.pageCount}
                  onChange={(e) => handleInputChange(e, 'pageCount')}
                />
                {error && error.pageCount && <FieldError>{error.pageCount}</FieldError>}
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
                  <option value="excellent">Excellent état</option>
                  <option value="bon">Bon état</option>
                  <option value="moyen">État moyen</option>
                  <option value="usage">État usé</option>
                </Select>

                <GuideBox theme={theme}>
                  <strong>Guide des états :</strong>
                  <br />
                  • <strong>Neuf</strong> : Jamais lu, comme neuf
                  <br />
                  • <strong>Excellent</strong> : Lu une fois, aucune marque
                  <br />
                  • <strong>Bon</strong> : Quelques marques d'usage mineures
                  <br />
                  • <strong>Moyen</strong> : Pages jaunies, coins légèrement abîmés
                  <br />
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
                  <div style={{ marginTop: '0.75rem' }}>
                    <ImageUploadLabel htmlFor="conditionPhotos" theme={theme}>
                      {bookData.conditionPhotos.length === 0 ? 'Ajouter des photos' : 'Ajouter d\'autres photos'}
                    </ImageUploadLabel>
                    <FileInput
                      id="conditionPhotos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                    />
                    <div style={{ 
                      fontSize: '0.85rem', 
                      marginTop: '0.5rem', 
                      opacity: 0.7 
                    }}>
                      Maximum 6 photos, 5MB par photo
                    </div>
                  </div>
                  {bookData.conditionPhotos.length > 0 && (
                    <PhotosContainer>
                      {bookData.conditionPhotos.map((photo, index) => (
                        <PhotoPreview key={index} theme={theme}>
                          <img src={photo} alt={`État du livre ${index + 1}`} />
                          <button onClick={() => removePhoto(index)}>×</button>
                        </PhotoPreview>
                      ))}
                    </PhotosContainer>
                  )}
                </SubFormGroup>
              </FormGroup>

              <ButtonContainer>
                <Button onClick={handleSubmit}>
                  Mettre en prêt
                </Button>
              </ButtonContainer>
            </div>
          </FormContainer>
        </Container>
      </Wrapper>
    </>
  );
} 