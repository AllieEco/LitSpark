# 📚 LitSpark - Plateforme de Partage de Livres

**LitSpark** est une plateforme moderne de partage et d'échange de livres entre lecteurs passionnés. Connectez-vous avec d'autres amoureux de la lecture, prêtez vos livres et découvrez de nouvelles histoires !

## ✨ Fonctionnalités Principales

### 📖 **Gestion de Bibliothèque Personnelle**
- Ajoutez vos livres à votre bibliothèque personnelle
- Gestion complète avec titre, auteur, ISBN, et photos
- Système de disponibilité (disponible/en prêt)
- Interface intuitive pour organiser votre collection

### 🔍 **Recherche et Découverte**
- Recherche avancée par titre, auteur ou ISBN
- Filtres par disponibilité et localisation
- Interface de recherche moderne avec résultats en temps réel
- Découverte de nouveaux livres et auteurs

### 💬 **Messagerie Instantanée** ⚡
- **Communication en temps réel** avec WebSockets
- Messages instantanés sans rechargement de page
- Notifications toast pour nouveaux messages
- Indicateur de statut de connexion
- Marquage automatique des messages comme lus
- Interface moderne et intuitive

### 👥 **Système d'Utilisateurs**
- Inscription et connexion sécurisées
- Authentification Google OAuth
- Profils utilisateurs personnalisables
- Système de noms d'utilisateur uniques
- Gestion des informations personnelles

### 📱 **Interface Moderne**
- Design responsive pour mobile et desktop
- Thème sombre/clair personnalisable
- Animations fluides et transitions élégantes
- Interface utilisateur intuitive et accessible

## 🚀 Technologies Utilisées

### Frontend
- **React 18** - Interface utilisateur moderne
- **Vite** - Build tool rapide
- **Styled Components** - Styling CSS-in-JS
- **React Router** - Navigation SPA
- **Socket.IO Client** - Communication temps réel

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **Socket.IO** - WebSockets temps réel
- **Passport.js** - Authentification
- **Multer** - Gestion des uploads

### Authentification
- **Google OAuth 2.0** - Connexion sociale
- **Sessions Express** - Gestion des sessions
- **bcryptjs** - Hachage sécurisé

## 📦 Installation et Démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- MongoDB (local ou cloud)
- Compte Google Developer (pour OAuth)

### 1. Cloner le Projet
```bash
git clone [url-du-repo]
cd litspark
```

### 2. Configuration Backend
```bash
cd backend
npm install
```

Créer un fichier `.env` dans le dossier `backend` :
```env
MONGODB_URI=mongodb://localhost:27017/litspark
SESSION_SECRET=votre_secret_session
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret
```

### 3. Configuration Frontend
```bash
cd ../frontend
npm install
```

### 4. Démarrer les Serveurs

**Backend (dans un terminal) :**
```bash
cd backend
npm start
```

**Frontend (dans un autre terminal) :**
```bash
cd frontend
npm run dev
```

### 5. Accéder à l'Application
- Frontend : http://localhost:5173
- Backend : http://localhost:5000

## 🔧 Configuration Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un existant
3. Activez l'API Google+ 
4. Créez des identifiants OAuth 2.0
5. Ajoutez `http://localhost:5000/auth/google/callback` aux URIs de redirection
6. Copiez le Client ID et Client Secret dans votre fichier `.env`

## 📱 Utilisation

### Première Connexion
1. Cliquez sur "Se connecter avec Google"
2. Autorisez l'accès à votre compte Google
3. Créez votre nom d'utilisateur unique
4. Complétez votre profil

### Ajouter des Livres
1. Allez dans "Ma Bibliothèque"
2. Cliquez sur "Ajouter un livre"
3. Saisissez l'ISBN ou les informations manuellement
4. Ajoutez une photo du livre
5. Marquez comme disponible

### Rechercher des Livres
1. Utilisez la barre de recherche principale
2. Filtrez par disponibilité
3. Cliquez sur un livre pour voir les détails
4. Contactez le propriétaire via la messagerie

### Messagerie Temps Réel
1. Accédez à la messagerie depuis votre profil
2. Les nouveaux messages apparaissent instantanément
3. Recevez des notifications pour les messages non lus
4. Communiquez en temps réel avec les autres utilisateurs

## 🎯 Fonctionnalités Avancées

### Messagerie Instantanée
- **WebSockets** pour communication temps réel
- **Notifications toast** pour nouveaux messages
- **Indicateur de statut** de connexion
- **Marquage automatique** comme lu
- **Gestion intelligente** des conversations

### Système de Prêt
- Demande de prêt via messagerie
- Suivi du statut des livres
- Notifications de disponibilité
- Historique des prêts

### Recherche Intelligente
- Recherche par ISBN avec API externe
- Suggestions automatiques
- Filtres avancés
- Résultats en temps réel

## 🔒 Sécurité

- Authentification sécurisée avec Google OAuth
- Sessions chiffrées
- Validation des données côté serveur
- Protection CSRF
- Gestion sécurisée des uploads

## 📊 Structure du Projet

```
litspark/
├── backend/
│   ├── models/          # Modèles MongoDB
│   ├── uploads/         # Fichiers uploadés
│   ├── index.js         # Serveur principal
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Composants React
│   │   ├── pages/       # Pages de l'application
│   │   ├── utils/       # Utilitaires (WebSockets)
│   │   └── theme/       # Thèmes et styles
│   └── package.json
└── README.md
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation technique
- Contactez l'équipe de développement

---

**LitSpark** - Partagez la passion de la lecture ! 📚✨

*Développé avec ❤️ pour la communauté des lecteurs*