# Guide des Prêts de Livres - LitSpark

## 🚀 Nouvelle Fonctionnalité : Système de Prêt Intégré

Cette fonctionnalité permet aux utilisateurs de demander l'emprunt de livres et aux propriétaires de gérer ces demandes facilement.

## 📚 Comment Emprunter un Livre

### Pour l'Emprunteur :

1. **Rechercher un livre** via la page de recherche
2. **Accéder au détail** du livre qui vous intéresse
3. **Cliquer sur "Emprunter"** (disponible uniquement si le livre est disponible)
4. **Confirmer la demande** dans la popup
5. **Attendre la réponse** du propriétaire (notification automatique)

### Statuts des Livres :
- ✅ **Disponible** : Peut être emprunté
- ⏳ **Réservé** : Demande en cours (48h max)
- 📚 **Prêté** : Actuellement emprunté
- ❌ **Indisponible** : Non disponible

## 🏠 Comment Gérer les Demandes (Propriétaire)

### Sur la Page de Détail de votre Livre :

1. **Demande en attente** : Section orange avec détails du demandeur
2. **Actions disponibles** :
   - ✅ **Accepter** : Le livre devient "prêté" (14 jours par défaut)
   - ❌ **Refuser** : Le livre redevient disponible

### Livre Prêté :

1. **Informations visibles** : Emprunteur, dates, statut
2. **Action disponible** : 📥 **Marquer comme retourné**

## 💬 Messagerie Automatique

Le système envoie automatiquement des messages :

### Lors d'une Demande :
```
"Bonjour ! Je souhaiterais emprunter votre livre [Titre]. 
Pouvons-nous nous organiser pour la remise ?"
```

### Lors d'une Acceptation :
```
"Super ! J'accepte de vous prêter [Titre]. Le livre est maintenant 
réservé pour vous jusqu'au [Date]. Contactez-moi pour organiser la remise !"
```

### Lors d'un Refus :
```
"Désolé, je ne peux pas prêter [Titre] pour le moment. 
Le livre est de nouveau disponible pour d'autres demandes."
```

### Lors d'un Retour :
```
"Merci d'avoir rendu [Titre] ! Le livre est de nouveau 
disponible pour d'autres emprunts."
```

## 🔔 Notifications Temps Réel

### Types de Notifications :

1. **📚 Nouvelle demande d'emprunt** (pour le propriétaire)
2. **✅ Demande acceptée** (pour l'emprunteur)
3. **❌ Demande refusée** (pour l'emprunteur)
4. **📥 Livre retourné** (pour l'emprunteur)

### Caractéristiques :
- Apparaissent en haut à droite de l'écran
- Auto-suppression après 10-15 secondes
- Cliquables pour aller à la messagerie
- Couleurs différentes selon le type

## ⚡ API Endpoints

### Routes Principales :

- `POST /api/livres/:id/demande-pret` - Faire une demande
- `POST /api/livres/:id/accepter-pret` - Accepter une demande
- `POST /api/livres/:id/refuser-pret` - Refuser une demande
- `POST /api/livres/:id/retour` - Marquer un retour
- `GET /api/mes-demandes-pret` - Voir ses demandes reçues

### Données Envoyées/Reçues :

#### Demande de Prêt :
```json
{
  "message": "Message personnalisé (optionnel)"
}
```

#### Réponse :
```json
{
  "message": "Demande de prêt envoyée avec succès !",
  "conversationId": "...",
  "expirationDate": "2024-01-15T10:00:00.000Z"
}
```

## 🔧 Structure des Données

### Modèle Book (Modifié) :

```javascript
{
  // ... champs existants
  statut: 'disponible' | 'reserve' | 'prete' | 'indisponible',
  
  demandePret: {
    demandeur: ObjectId,
    dateDemande: Date,
    dateExpiration: Date, // 48h après la demande
    statut: 'en_attente' | 'acceptee' | 'refusee' | 'expiree'
  },
  
  pretActuel: {
    emprunteur: ObjectId,
    dateDebut: Date,
    dateFinPrevue: Date,
    dateRetourEffective: Date,
    prolongations: Number
  }
}
```

## 🎯 Événements Socket.IO

### Émis par le Serveur :

- `loan_request` - Nouvelle demande reçue
- `loan_accepted` - Demande acceptée
- `loan_rejected` - Demande refusée
- `book_returned` - Livre retourné

### Format des Événements :

```javascript
// loan_request
{
  bookId: "...",
  bookTitle: "...",
  requester: "username",
  conversationId: "...",
  message: "..."
}

// loan_accepted
{
  bookId: "...",
  bookTitle: "...",
  returnDate: "2024-01-29T...",
  conversationId: "..."
}
```

## 🚦 Règles de Gestion

### Contraintes :
- ⏰ **Réservation** : Expire automatiquement après 48h
- 👤 **Auto-emprunt** : Impossible d'emprunter ses propres livres
- 🔒 **Une demande** : Un seul emprunteur à la fois
- 📅 **Durée standard** : 14 jours par défaut

### Flux de Statuts :
```
Disponible → [Demande] → Réservé → [Acceptation] → Prêté → [Retour] → Disponible
              ↓
           [Refus/Expiration] → Disponible
```

## 🎨 Interface Utilisateur

### Couleurs par Statut :
- 🟢 **Disponible** : Vert (#4CAF50)
- 🟠 **Réservé** : Orange (#FF9800)
- 🔴 **Prêté** : Rouge (#f44336)
- ⚫ **Indisponible** : Gris (#9E9E9E)

### Éléments Visuels :
- **Badges colorés** selon le statut
- **Sections dédiées** pour les demandes/prêts
- **Boutons adaptatifs** selon les actions possibles
- **Notifications toast** en temps réel

---

## 🔍 Utilisation

La fonctionnalité est maintenant **entièrement fonctionnelle** ! 

1. Les emprunteurs peuvent faire des demandes
2. Les propriétaires reçoivent des notifications
3. La messagerie s'intègre automatiquement
4. Le suivi des prêts est complet

**Prêt à tester ! 🎉** 