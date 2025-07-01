const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createServer } = require('http');
const { Server } = require('socket.io');
const User = require('./models/User');
const Book = require('./models/Book');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const bcrypt = require('bcryptjs');

// Chargement des variables d'environnement
dotenv.config();
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Configuré' : 'MANQUANT');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Configuré' : 'MANQUANT');

const app = express();
const server = createServer(app);

// Configuration Socket.IO
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Stockage des connexions utilisateurs
const userSockets = new Map();

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('Nouvelle connexion Socket.IO:', socket.id);

  // Authentification de l'utilisateur
  socket.on('authenticate', async (userId) => {
    try {
      const user = await User.findById(userId);
      if (user) {
        userSockets.set(userId, socket.id);
        socket.userId = userId;
        socket.join(`user_${userId}`);
        console.log(`Utilisateur ${user.username} connecté via Socket.IO`);
      }
    } catch (error) {
      console.error('Erreur d\'authentification Socket.IO:', error);
    }
  });

  // Rejoindre une conversation
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`Socket ${socket.id} a rejoint la conversation ${conversationId}`);
  });

  // Quitter une conversation
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`Socket ${socket.id} a quitté la conversation ${conversationId}`);
  });

  // Marquer les messages comme lus
  socket.on('mark_as_read', async (data) => {
    try {
      const { conversationId, userId } = data;
      
      // Marquer les messages comme lus dans la base de données
      await Message.updateMany(
        { 
          conversationId: conversationId,
          sender: { $ne: userId },
          isRead: false 
        },
        { isRead: true }
      );

      // Notifier les autres participants
      socket.to(`conversation_${conversationId}`).emit('messages_read', {
        conversationId,
        readBy: userId
      });
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  });

  // Déconnexion
  socket.on('disconnect', () => {
    if (socket.userId) {
      userSockets.delete(socket.userId);
      console.log(`Utilisateur ${socket.userId} déconnecté de Socket.IO`);
    }
    console.log('Déconnexion Socket.IO:', socket.id);
  });
});

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Session pour Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Mettre à false pour le développement local
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
    sameSite: 'lax'
  },
  name: 'connect.sid'
}));
app.use(passport.initialize());
app.use(passport.session());

// Configuration de la stratégie Google
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pret_livre', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connecté à MongoDB');
}).catch(err => {
  console.error('Erreur de connexion MongoDB:', err);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Profil Google reçu:', profile.id, profile.emails[0].value);
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      // Vérifier si un utilisateur existe déjà avec cet email
      const existingUser = await User.findOne({ email: profile.emails[0].value });
      if (existingUser) {
        // Si l'utilisateur existe déjà avec un compte classique, on lie son compte Google
        existingUser.googleId = profile.id;
        await existingUser.save();
        console.log('Compte Google lié à un utilisateur existant');
        return done(null, existingUser);
      }

      // Créer un nouveau compte
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        displayName: profile.displayName,
        nom: profile.name.familyName,
        prenom: profile.name.givenName
      });
      console.log('Nouveau compte Google créé');
    }
    done(null, user);
  } catch (err) {
    console.error('Erreur dans la stratégie Google:', err);
    done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Routes d'authentification
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'consent select_account' }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/', prompt: 'consent select_account' }),
  (req, res) => {
    // Rediriger vers la page de création de username si l'utilisateur n'en a pas
    if (!req.user.username) {
      res.redirect('http://localhost:5173/creation-username');
    } else {
      res.redirect('http://localhost:5173/compte');
    }
  }
);

app.get('/api/user', async (req, res) => {
  if (req.isAuthenticated() && req.user) {
    const user = await User.findById(req.user._id);
    res.json(user);
  } else {
    res.status(401).json({ message: 'Non authentifié' });
  }
});

// Route de déconnexion
app.post('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid', { path: '/' });
      res.status(200).json({ message: 'Déconnecté' });
    });
  });
});

// Route pour déconnecter aussi de Google
app.get('/logout/google', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid', { path: '/' });
      // Redirige vers le logout Google, puis retour à la page d'accueil
      res.redirect('https://accounts.google.com/Logout?continue=https://www.google.com&continue=http://localhost:5173');
    });
  });
});

app.put('/api/user/infos', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }
  const { nom, prenom, adresseLigne1, adresseLigne2, codePostal, ville, telephone } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (nom !== undefined) user.nom = nom;
    if (prenom !== undefined) user.prenom = prenom;
    if (adresseLigne1 !== undefined) user.adresseLigne1 = adresseLigne1;
    if (adresseLigne2 !== undefined) user.adresseLigne2 = adresseLigne2;
    if (codePostal !== undefined) user.codePostal = codePostal;
    if (ville !== undefined) user.ville = ville;
    if (telephone !== undefined) user.telephone = telephone;
    await user.save();
    res.json({ nom: user.nom, prenom: user.prenom, adresseLigne1: user.adresseLigne1, adresseLigne2: user.adresseLigne2, codePostal: user.codePostal, ville: user.ville, telephone: user.telephone });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/user/stats', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }
  try {
    const user = await User.findById(req.user._id);
    res.json(user.stats);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Nouvelle route pour vérifier la disponibilité d'un username
app.get('/api/username/check/:username', async (req, res) => {
  const username = req.params.username;
  const exists = await User.exists({ username });
  res.json({ available: !exists });
});

// Nouvelle route pour créer un utilisateur après Google login
app.post('/api/user/first-login', async (req, res) => {
  if (!req.session.passport || !req.session.passport.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }
  // Récupérer les infos du profil Google
  const googleUser = await User.findById(req.session.passport.user);
  if (!googleUser) {
    // Créer l'utilisateur
    const profile = req.session.profileGoogle;
    const email = profile && profile.emails && profile.emails[0] ? profile.emails[0].value : '';
    const displayName = profile ? profile.displayName : '';
    const googleId = profile ? profile.id : '';
    const newUser = await User.create({
      googleId,
      displayName,
      email
    });
    req.login(newUser, (err) => {
      if (err) return res.status(500).json({ message: 'Erreur de connexion' });
      return res.json({ success: true });
    });
  } else {
    return res.status(400).json({ message: 'Utilisateur déjà existant' });
  }
});

// Route pour vérifier si un email est déjà utilisé avec Google
app.post('/api/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (user && user.googleId) {
      return res.json({ isGoogleUser: true });
    }
    
    res.json({ isGoogleUser: false });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route d'inscription
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, nom, prenom } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Validation du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial' 
      });
    }

    // Créer le nouvel utilisateur
    const user = await User.create({
      email,
      password,
      nom,
      prenom,
      displayName: `${prenom} ${nom}`
    });

    // Connecter l'utilisateur
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la connexion' });
      }
      res.json({ message: 'Inscription réussie' });
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route de connexion
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier si c'est un compte Google
    if (user.googleId && !user.password) {
      return res.status(400).json({ 
        message: 'Ce compte utilise la connexion Google. Veuillez vous connecter avec Google.' 
      });
    }

    // Vérifier le mot de passe
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Connecter l'utilisateur
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la connexion' });
      }
      res.json({ message: 'Connexion réussie' });
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour supprimer un compte utilisateur
app.delete('/api/user', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }
  try {
    await User.findByIdAndDelete(req.user._id);
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie('connect.sid', { path: '/' });
        res.status(200).json({ message: 'Compte supprimé avec succès' });
      });
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression du compte' });
  }
});

// Route pour mettre à jour le username
app.post('/api/users/username', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  const { username } = req.body;

  try {
    // Vérifier si le username est déjà pris
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(409).json({ message: "Ce nom d'utilisateur est déjà pris" });
    }

    // Mettre à jour le username
    const user = await User.findById(req.user._id);
    user.username = username;
    await user.save();

    res.json({ message: "Nom d'utilisateur mis à jour avec succès", username });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour récupérer les statistiques de la bibliothèque
app.get('/api/user/bibliotheque/stats', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }
  try {
    // Calculer les vraies statistiques à partir des livres en base
    const livresMisEnPret = await Book.countDocuments({ proprietaire: req.user._id });
    
    const user = await User.findById(req.user._id);
    const stats = {
      livresEmpruntes: user.stats?.empruntes || 0,
      livresPretees: user.stats?.pretes || 0,
      livresMisEnPret: livresMisEnPret
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour récupérer la bibliothèque de l'utilisateur
app.get('/api/user/bibliotheque', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }
  try {
    // Récupérer tous les livres de l'utilisateur
    const livresEnPret = await Book.find({ proprietaire: req.user._id }).sort({ dateAjout: -1 });
    const dernierLivreEmprunte = livresEnPret.length > 0 ? livresEnPret[0] : null;

    res.json({
      livres: livresEnPret,
      dernierLivreEmprunte: dernierLivreEmprunte
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour récupérer les livres empruntés par l'utilisateur
app.get('/api/user/livres-empruntes', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }
  try {
    // Récupérer tous les livres actuellement empruntés par l'utilisateur
    const livresEmpruntes = await Book.find({ 
      'pretActuel.emprunteur': req.user._id,
      statut: 'prete'
    })
    .populate('proprietaire', 'username')
    .sort({ 'pretActuel.dateDebut': -1 });

    res.json({
      livres: livresEmpruntes
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des livres empruntés:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route de recherche de livres disponibles (doit être avant /api/livres/:id)
app.get('/api/livres/recherche', async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json({ livres: [], total: 0 });
    }
    
    const searchTerms = q.trim().split(/\s+/);
    
    // Créer une requête de recherche flexible
    const searchConditions = searchTerms.map(term => ({
      $or: [
        { titre: { $regex: term, $options: 'i' } },
        { auteur: { $regex: term, $options: 'i' } },
        { isbn: { $regex: term, $options: 'i' } },
        { editeur: { $regex: term, $options: 'i' } },
        { genre: { $regex: term, $options: 'i' } },
        { resume: { $regex: term, $options: 'i' } },
        { tags: { $in: [new RegExp(term, 'i')] } }
      ]
    }));
    
    let query = {
      $and: [
        // Livres disponibles seulement (utilise le nouveau champ statut)
        { $or: [{ statut: 'disponible' }, { statut: { $exists: false } }] },
        // Recherche textuelle
        { $and: searchConditions }
      ]
    };

    // Si l'utilisateur est connecté, exclure ses propres livres
    if (req.isAuthenticated() && req.user) {
      query.$and.push({ proprietaire: { $ne: req.user._id } });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const livres = await Book.find(query)
      .populate('proprietaire', 'username ville')
      .sort({ 
        // Tri par pertinence : d'abord par titre, puis par auteur
        titre: 'asc',
        auteur: 'asc'
      })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Book.countDocuments(query);
    
    res.json({
      livres,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
    
  } catch (err) {
    console.error('Erreur de recherche:', err);
    res.status(500).json({ message: 'Erreur lors de la recherche' });
  }
});

// Route pour récupérer un livre par ID
app.get('/api/livres/:id', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }
  
  try {
    const livre = await Book.findOne({ 
      _id: req.params.id, 
      proprietaire: req.user._id 
    })
    .populate('demandePret.demandeur', 'username')
    .populate('pretActuel.emprunteur', 'username');
    
    if (!livre) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    
    res.json(livre);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour récupérer les détails d'un livre disponible (pour la recherche)
app.get('/api/livres/details/:id', async (req, res) => {
  try {
    const livre = await Book.findById(req.params.id)
      .populate('proprietaire', 'username ville telephone email')
      .populate('demandePret.demandeur', 'username')
      .populate('pretActuel.emprunteur', 'username');
    
    if (!livre) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    
    res.json(livre);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour supprimer un livre
app.delete('/api/livres/:id', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }
  
  try {
    const livre = await Book.findOneAndDelete({ 
      _id: req.params.id, 
      proprietaire: req.user._id 
    });
    
    if (!livre) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    
    res.json({ message: 'Livre supprimé avec succès' });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour récupérer les informations publiques d'un utilisateur spécifique
app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('username ville stats profilePhotoUrl');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json({
      username: user.username,
      ville: user.ville,
      profilePhotoUrl: user.profilePhotoUrl,
      livresPrets: user.stats?.pretes || 0
    });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour récupérer les livres d'un utilisateur spécifique (bibliothèque publique)
app.get('/api/books/user/:userId', async (req, res) => {
  try {
    const books = await Book.find({ proprietaire: req.params.userId })
      .sort({ dateAjout: -1 });
    
    res.json(books);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route simple pour ajouter un livre
app.post('/api/livres', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }
  
  try {
    const { titre, auteur, isbn, editeur, anneePublication, genre, nombrePages, resume, etat, imageUrl, tags } = req.body;
    
    console.log('Données reçues pour le livre:', {
      titre,
      auteur,
      isbn,
      tags: tags || [],
      imageUrl: imageUrl ? 'Image présente' : 'Pas d\'image',
      imageUrlLength: imageUrl ? imageUrl.length : 0
    });
    
    const newBook = new Book({
      titre,
      auteur,
      isbn,
      editeur,
      anneePublication,
      genre,
      nombrePages,
      resume,
      etat,
      imageUrl,
      tags: tags || [],
      proprietaire: req.user._id,
      proprietaireNom: req.user.displayName || `${req.user.prenom} ${req.user.nom}` || req.user.username || 'Utilisateur'
    });
    
    await newBook.save();
    
    res.status(201).json({
      message: 'Livre ajouté avec succès',
      book: newBook
    });
  } catch (err) {
    console.error('Erreur lors de l\'ajout du livre:', err);
    res.status(500).json({ 
      message: 'Erreur serveur lors de l\'ajout du livre',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne'
    });
  }
});

// ROUTES POUR LES DEMANDES DE PRÊT

// Route pour faire une demande de prêt
app.post('/api/livres/:id/demande-pret', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const bookId = req.params.id;
    const demandeurId = req.user._id;
    const { message } = req.body;

    // Récupérer le livre avec les informations du propriétaire
    const livre = await Book.findById(bookId).populate('proprietaire', 'username _id');
    
    if (!livre) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Vérifier que l'utilisateur ne demande pas à emprunter son propre livre
    if (livre.proprietaire._id.toString() === demandeurId.toString()) {
      return res.status(400).json({ message: 'Vous ne pouvez pas emprunter votre propre livre' });
    }

    // Vérifier que le livre est disponible
    if (livre.statut !== 'disponible') {
      let messageStatut = 'Ce livre n\'est pas disponible';
      if (livre.statut === 'reserve') {
        messageStatut = 'Ce livre est déjà réservé';
      } else if (livre.statut === 'prete') {
        messageStatut = 'Ce livre est actuellement prêté';
      }
      return res.status(400).json({ message: messageStatut });
    }

    // Réserver le livre
    livre.reserver(demandeurId);
    await livre.save();

    // Créer ou récupérer la conversation entre les deux utilisateurs
    let conversation = await Conversation.findOne({
      participants: { $all: [demandeurId, livre.proprietaire._id] },
      deletedBy: { $ne: demandeurId }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [demandeurId, livre.proprietaire._id],
        bookInfo: {
          titre: livre.titre,
          auteur: livre.auteur,
          imageUrl: livre.imageUrl,
          bookId: livre._id
        },
        unreadCount: new Map()
      });
      await conversation.save();
    }

    // Créer le message automatique pour informer le propriétaire
    const messageContent = message || 
      `Bonjour ! Je souhaiterais emprunter votre livre "${livre.titre}" de ${livre.auteur}. Pouvons-nous convenir d'un arrangement ?`;

    const demandePretMessage = new Message({
      conversationId: conversation._id,
      sender: demandeurId,
      content: messageContent
    });

    await demandePretMessage.save();

    // Mettre à jour la conversation
    conversation.lastMessage = demandePretMessage._id;
    conversation.lastMessageDate = new Date();
    conversation.incrementUnreadCount(livre.proprietaire._id);
    await conversation.save();

    // Notifier le propriétaire via Socket.IO
    const messageData = {
      id: demandePretMessage._id,
      conversationId: conversation._id,
      content: demandePretMessage.content,
      sender: demandeurId,
      senderUsername: req.user.username,
      timestamp: new Date(demandePretMessage.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: demandePretMessage.createdAt
    };

    // Émettre le nouveau message via Socket.IO
    io.to(`conversation_${conversation._id}`).emit('new_message', messageData);

    // Notifier le propriétaire de la nouvelle demande de prêt
    io.to(`user_${livre.proprietaire._id}`).emit('loan_request', {
      bookId: livre._id,
      bookTitle: livre.titre,
      requester: req.user.username,
      conversationId: conversation._id,
      message: messageContent
    });

    // Notifier de la nouvelle conversation si nécessaire
    io.to(`user_${livre.proprietaire._id}`).emit('new_conversation', {
      conversationId: conversation._id,
      sender: {
        id: req.user._id,
        username: req.user.username
      },
      lastMessage: messageData,
      bookInfo: conversation.bookInfo,
      unreadCount: 1
    });

    res.json({ 
      message: 'Demande de prêt envoyée avec succès !',
      conversationId: conversation._id,
      expirationDate: livre.demandePret.dateExpiration
    });

  } catch (error) {
    console.error('Erreur lors de la demande de prêt:', error);
    res.status(500).json({ message: error.message || 'Erreur serveur' });
  }
});

// Route pour accepter une demande de prêt
app.post('/api/livres/:id/accepter-pret', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const bookId = req.params.id;
    const { dureeJours = 14 } = req.body;

    const livre = await Book.findById(bookId)
      .populate('proprietaire', 'username _id')
      .populate('demandePret.demandeur', 'username _id');
    
    if (!livre) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (livre.proprietaire._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous n\'êtes pas le propriétaire de ce livre' });
    }

    // Accepter la demande de prêt
    livre.accepterPret(dureeJours);
    await livre.save();

    // Mettre à jour les statistiques des utilisateurs
    // Incrémenter le compteur de livres empruntés pour l'emprunteur
    await User.findByIdAndUpdate(
      livre.demandePret.demandeur._id,
      { $inc: { 'stats.empruntes': 1 } }
    );

    // Incrémenter le compteur de livres prêtés pour le propriétaire
    await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { 'stats.pretes': 1 } }
    );

    // Trouver la conversation et envoyer un message de confirmation
    const conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, livre.demandePret.demandeur._id] }
    });

    if (conversation) {
      // Récupérer le message personnalisé du propriétaire
      const proprietaire = await User.findById(req.user._id);
      let messageContent = proprietaire.messagesPersonnalises?.messageAcceptation || 
        'Bonne nouvelle ! Votre demande pour "{titre}" a été acceptée. Profitez bien de votre lecture !';
      
      // Remplacer les variables dans le message
      messageContent = messageContent.replace('{titre}', livre.titre)
        .replace('{dateRetour}', livre.pretActuel.dateFinPrevue.toLocaleDateString('fr-FR'));
      
      const confirmationMessage = new Message({
        conversationId: conversation._id,
        sender: req.user._id,
        content: messageContent
      });

      await confirmationMessage.save();

      // Mettre à jour la conversation
      conversation.lastMessage = confirmationMessage._id;
      conversation.lastMessageDate = new Date();
      conversation.incrementUnreadCount(livre.demandePret.demandeur._id);
      await conversation.save();

      // Notifier via Socket.IO
      const messageData = {
        id: confirmationMessage._id,
        conversationId: conversation._id,
        content: confirmationMessage.content,
        sender: req.user._id,
        senderUsername: req.user.username,
        timestamp: new Date(confirmationMessage.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: confirmationMessage.createdAt
      };

      io.to(`conversation_${conversation._id}`).emit('new_message', messageData);
      
      // Notifier l'emprunteur que sa demande est acceptée
      io.to(`user_${livre.demandePret.demandeur._id}`).emit('loan_accepted', {
        bookId: livre._id,
        bookTitle: livre.titre,
        returnDate: livre.pretActuel.dateFinPrevue,
        conversationId: conversation._id
      });
    }

    res.json({ 
      message: 'Demande de prêt acceptée !',
      returnDate: livre.pretActuel.dateFinPrevue 
    });

  } catch (error) {
    console.error('Erreur lors de l\'acceptation du prêt:', error);
    res.status(500).json({ message: error.message || 'Erreur serveur' });
  }
});

// Route pour refuser une demande de prêt
app.post('/api/livres/:id/refuser-pret', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const bookId = req.params.id;
    const { raison } = req.body;

    const livre = await Book.findById(bookId)
      .populate('proprietaire', 'username _id')
      .populate('demandePret.demandeur', 'username _id');
    
    if (!livre) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (livre.proprietaire._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous n\'êtes pas le propriétaire de ce livre' });
    }

    const demandeurId = livre.demandePret.demandeur._id;

    // Refuser la demande de prêt
    livre.refuserPret();
    await livre.save();

    // Trouver la conversation et envoyer un message
    const conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, demandeurId] }
    });

    if (conversation) {
      // Récupérer le message personnalisé du propriétaire ou utiliser la raison fournie
      let messageContent;
      if (raison) {
        messageContent = raison;
      } else {
        const proprietaire = await User.findById(req.user._id);
        messageContent = proprietaire.messagesPersonnalises?.messageRefus || 
          'Désolé, votre demande pour "{titre}" n\'a pas pu être acceptée.';
        
        // Remplacer les variables dans le message
        messageContent = messageContent.replace('{titre}', livre.titre);
      }
      
      const refusMessage = new Message({
        conversationId: conversation._id,
        sender: req.user._id,
        content: messageContent
      });

      await refusMessage.save();

      // Mettre à jour la conversation
      conversation.lastMessage = refusMessage._id;
      conversation.lastMessageDate = new Date();
      conversation.incrementUnreadCount(demandeurId);
      await conversation.save();

      // Notifier via Socket.IO
      const messageData = {
        id: refusMessage._id,
        conversationId: conversation._id,
        content: refusMessage.content,
        sender: req.user._id,
        senderUsername: req.user.username,
        timestamp: new Date(refusMessage.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: refusMessage.createdAt
      };

      io.to(`conversation_${conversation._id}`).emit('new_message', messageData);
      
      // Notifier l'emprunteur que sa demande est refusée
      io.to(`user_${demandeurId}`).emit('loan_rejected', {
        bookId: livre._id,
        bookTitle: livre.titre,
        reason: raison,
        conversationId: conversation._id
      });
    }

    res.json({ message: 'Demande de prêt refusée' });

  } catch (error) {
    console.error('Erreur lors du refus du prêt:', error);
    res.status(500).json({ message: error.message || 'Erreur serveur' });
  }
});

// Route pour marquer le retour d'un livre (propriétaire uniquement)
app.post('/api/livres/:id/retour', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const bookId = req.params.id;

    const livre = await Book.findById(bookId)
      .populate('proprietaire', 'username _id')
      .populate('pretActuel.emprunteur', 'username _id');
    
    if (!livre) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (livre.proprietaire._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous n\'êtes pas le propriétaire de ce livre' });
    }

    const emprunteurId = livre.pretActuel.emprunteur._id;

    // Marquer le retour
    livre.retournerLivre();
    await livre.save();

    // Mettre à jour les statistiques des utilisateurs
    // Décrémenter le compteur de livres empruntés pour l'emprunteur
    await User.findByIdAndUpdate(
      emprunteurId,
      { $inc: { 'stats.empruntes': -1 } }
    );

    // Décrémenter le compteur de livres prêtés pour le propriétaire
    await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { 'stats.pretes': -1 } }
    );

    // Trouver la conversation et envoyer un message de confirmation
    const conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, emprunteurId] }
    });

    if (conversation) {
      // Récupérer le message personnalisé du propriétaire
      const proprietaire = await User.findById(req.user._id);
      let messageContent = proprietaire.messagesPersonnalises?.messageRetour || 
        'Merci d\'avoir rendu "{titre}" ! Le livre est de nouveau disponible pour d\'autres emprunts.';
      
      // Remplacer les variables dans le message
      messageContent = messageContent.replace('{titre}', livre.titre);
      
      const retourMessage = new Message({
        conversationId: conversation._id,
        sender: req.user._id,
        content: messageContent
      });

      await retourMessage.save();

      // Mettre à jour la conversation
      conversation.lastMessage = retourMessage._id;
      conversation.lastMessageDate = new Date();
      conversation.incrementUnreadCount(emprunteurId);
      await conversation.save();

      // Notifier via Socket.IO
      const messageData = {
        id: retourMessage._id,
        conversationId: conversation._id,
        content: retourMessage.content,
        sender: req.user._id,
        senderUsername: req.user.username,
        timestamp: new Date(retourMessage.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: retourMessage.createdAt
      };

      io.to(`conversation_${conversation._id}`).emit('new_message', messageData);
      
      // Notifier l'ex-emprunteur
      io.to(`user_${emprunteurId}`).emit('book_returned', {
        bookId: livre._id,
        bookTitle: livre.titre,
        conversationId: conversation._id
      });
    }

    res.json({ message: 'Retour du livre confirmé !' });

  } catch (error) {
    console.error('Erreur lors du retour du livre:', error);
    res.status(500).json({ message: error.message || 'Erreur serveur' });
  }
});

// Route pour récupérer les demandes de prêt en attente pour un propriétaire
app.get('/api/mes-demandes-pret', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const demandesEnAttente = await Book.find({
      proprietaire: req.user._id,
      statut: 'reserve',
      'demandePret.statut': 'en_attente'
    })
    .populate('demandePret.demandeur', 'username')
    .sort({ 'demandePret.dateDemande': -1 });

    const demandes = demandesEnAttente.map(livre => ({
      id: livre._id,
      titre: livre.titre,
      auteur: livre.auteur,
      imageUrl: livre.imageUrl,
      demandeur: livre.demandePret.demandeur.username,
      demandeurId: livre.demandePret.demandeur._id,
      dateDemande: livre.demandePret.dateDemande,
      dateExpiration: livre.demandePret.dateExpiration
    }));

    res.json({ demandes });

  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Configuration multer pour l'upload des photos de profil
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads', 'profile-photos');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user._id}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers JPG et PNG sont autorisés'), false);
    }
  }
});

// Servir les fichiers statiques des uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route pour l'upload de photo de profil
app.post('/api/user/profile-photo', upload.single('profilePhoto'), async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    // Supprimer l'ancienne photo si elle existe
    const user = await User.findById(req.user._id);
    if (user.profilePhotoUrl) {
      const oldPhotoPath = path.join(__dirname, user.profilePhotoUrl.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Mettre à jour l'URL de la photo dans la base de données
    const profilePhotoUrl = `/uploads/profile-photos/${req.file.filename}`;
    user.profilePhotoUrl = profilePhotoUrl;
    await user.save();

    res.json({
      message: 'Photo de profil mise à jour avec succès',
      profilePhotoUrl: profilePhotoUrl,
      ...user.toObject()
    });

  } catch (error) {
    console.error('Erreur upload photo:', error);
    
    // Supprimer le fichier uploadé en cas d'erreur
    if (req.file) {
      const filePath = path.join(__dirname, 'uploads', 'profile-photos', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({ message: 'Erreur lors de l\'upload de la photo' });
  }
});

// ROUTES DE MESSAGERIE

// Route pour récupérer les conversations de l'utilisateur
app.get('/api/conversations', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      deletedBy: { $ne: req.user._id }  // Exclure les conversations supprimées par l'utilisateur
    })
    .populate('participants', 'username')
    .populate('lastMessage', 'content createdAt')
    .sort({ lastMessageDate: -1 });

    const conversationsData = conversations.map(conv => {
      const otherParticipant = conv.participants.find(p => p._id.toString() !== req.user._id.toString());
      const unreadCount = conv.unreadCount.get(req.user._id.toString()) || 0;
      
      console.log('Conversation ID:', conv._id, 'BookInfo:', conv.bookInfo);
      
      return {
        id: conv._id,
        username: otherParticipant?.username || 'Utilisateur inconnu',
        lastMessage: conv.lastMessage?.content || '',
        timestamp: conv.lastMessage?.createdAt ? 
          new Date(conv.lastMessage.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 
          '',
        unreadCount,
        bookInfo: conv.bookInfo || null
      };
    });

    const totalUnread = conversations.reduce((total, conv) => {
      return total + (conv.unreadCount.get(req.user._id.toString()) || 0);
    }, 0);

    res.json({
      conversations: conversationsData,
      unreadCount: totalUnread
    });
  } catch (error) {
    console.error('Erreur lors du chargement des conversations:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour récupérer le nombre de messages non lus
app.get('/api/conversations/unread-count', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      deletedBy: { $ne: req.user._id }  // Exclure les conversations supprimées par l'utilisateur
    });

    const totalUnread = conversations.reduce((total, conv) => {
      return total + (conv.unreadCount.get(req.user._id.toString()) || 0);
    }, 0);

    res.json({ count: totalUnread });
  } catch (error) {
    console.error('Erreur lors du comptage des messages non lus:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour récupérer les messages d'une conversation
app.get('/api/conversations/:id/messages', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id,
      deletedBy: { $ne: req.user._id }  // Vérifier que l'utilisateur n'a pas supprimé la conversation
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    const messages = await Message.find({ conversationId: req.params.id })
      .populate('sender', 'username')
      .sort({ createdAt: 1 });

    const messagesData = messages.map(msg => ({
      id: msg._id,
      content: msg.content,
      isOwn: msg.sender._id.toString() === req.user._id.toString(),
      timestamp: new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      sender: msg.sender.username
    }));

    res.json({ messages: messagesData });
  } catch (error) {
    console.error('Erreur lors du chargement des messages:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour envoyer un message dans une conversation existante
app.post('/api/conversations/:id/messages', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Le message ne peut pas être vide' });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id,
      deletedBy: { $ne: req.user._id }  // Vérifier que l'utilisateur n'a pas supprimé la conversation
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Créer le message
    const newMessage = new Message({
      conversationId: conversation._id,
      sender: req.user._id,
      content: content.trim()
    });

    await newMessage.save();

    // Mettre à jour la conversation
    conversation.lastMessage = newMessage._id;
    conversation.lastMessageDate = new Date();
    conversation.incrementUnreadCount(conversation.getOtherParticipant(req.user._id));
    await conversation.save();

    // Préparer les données du message pour Socket.IO
    const messageData = {
      id: newMessage._id,
      conversationId: conversation._id,
      content: newMessage.content,
      sender: req.user._id,
      senderUsername: req.user.username,
      timestamp: new Date(newMessage.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: newMessage.createdAt
    };

    // Émettre le nouveau message via Socket.IO
    io.to(`conversation_${conversation._id}`).emit('new_message', messageData);

    // Notifier le destinataire de la nouvelle conversation
    io.to(`user_${conversation.getOtherParticipant(req.user._id)}`).emit('new_conversation', {
      conversationId: conversation._id,
      sender: {
        id: req.user._id,
        username: req.user.username
      },
      lastMessage: messageData,
      bookInfo: conversation.bookInfo,
      unreadCount: 1
    });

    res.json({
      id: newMessage._id,
      content: newMessage.content,
      isOwn: true,
      timestamp: new Date(newMessage.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour créer une nouvelle conversation
app.post('/api/conversations/new', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const { recipient, message, bookInfo } = req.body;
    
    console.log('Données reçues pour nouvelle conversation:');
    console.log('- recipient:', recipient);
    console.log('- message:', message);
    console.log('- bookInfo:', bookInfo);

    if (!recipient || !message) {
      return res.status(400).json({ message: 'Destinataire et message sont requis' });
    }

    // Vérifier que l'utilisateur destinataire existe
    const recipientUser = await User.findOne({ username: recipient });
    if (!recipientUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier qu'on n'essaie pas de s'envoyer un message à soi-même
    if (recipientUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous envoyer un message à vous-même' });
    }

    // Vérifier si une conversation existe déjà entre ces deux utilisateurs (non supprimée par l'utilisateur actuel)
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientUser._id] },
      deletedBy: { $ne: req.user._id }  // Ne pas récupérer les conversations supprimées par l'utilisateur
    });

    // Si pas de conversation ou si elle a été supprimée, vérifier s'il faut la "restaurer" ou en créer une nouvelle
    if (!conversation) {
      // Vérifier s'il existe une conversation supprimée par l'utilisateur actuel
      const deletedConversation = await Conversation.findOne({
        participants: { $all: [req.user._id, recipientUser._id] },
        deletedBy: req.user._id
      });

      if (deletedConversation) {
        // Restaurer la conversation (retirer l'utilisateur de deletedBy)
        deletedConversation.deletedBy = deletedConversation.deletedBy.filter(
          id => id.toString() !== req.user._id.toString()
        );
        conversation = deletedConversation;
        console.log('Conversation restaurée pour l\'utilisateur');
      } else {
        // Créer une nouvelle conversation
        const conversationData = {
          participants: [req.user._id, recipientUser._id],
          unreadCount: new Map()
        };
        
        // Ajouter les informations du livre si disponibles
        if (bookInfo) {
          console.log('Ajout des bookInfo à la conversation:', bookInfo);
          conversationData.bookInfo = {
            titre: bookInfo.titre,
            auteur: bookInfo.auteur,
            imageUrl: bookInfo.imageUrl,
            bookId: bookInfo.bookId
          };
          console.log('ConversationData avec bookInfo:', conversationData);
        } else {
          console.log('Aucune bookInfo fournie');
        }
        
        conversation = new Conversation(conversationData);
        await conversation.save();
      }
    }

    // Créer le message
    const newMessage = new Message({
      conversationId: conversation._id,
      sender: req.user._id,
      content: message.trim()
    });

    await newMessage.save();

    // Mettre à jour la conversation
    conversation.lastMessage = newMessage._id;
    conversation.lastMessageDate = new Date();
    conversation.incrementUnreadCount(recipientUser._id);
    await conversation.save();

    // Préparer les données du message pour Socket.IO
    const messageData = {
      id: newMessage._id,
      conversationId: conversation._id,
      content: newMessage.content,
      sender: req.user._id,
      senderUsername: req.user.username,
      timestamp: new Date(newMessage.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: newMessage.createdAt
    };

    // Émettre le nouveau message via Socket.IO
    io.to(`conversation_${conversation._id}`).emit('new_message', messageData);

    // Notifier le destinataire de la nouvelle conversation
    io.to(`user_${recipientUser._id}`).emit('new_conversation', {
      conversationId: conversation._id,
      sender: {
        id: req.user._id,
        username: req.user.username
      },
      lastMessage: messageData,
      bookInfo: conversation.bookInfo,
      unreadCount: 1
    });

    res.json({ message: 'Message envoyé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour marquer une conversation comme lue
app.put('/api/conversations/:id/read', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id,
      deletedBy: { $ne: req.user._id }  // Vérifier que l'utilisateur n'a pas supprimé la conversation
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Réinitialiser le compteur de messages non lus pour cet utilisateur
    conversation.resetUnreadCount(req.user._id);
    await conversation.save();

    // Marquer tous les messages non lus de cette conversation comme lus
    await Message.updateMany(
      { 
        conversationId: req.params.id,
        sender: { $ne: req.user._id },
        isRead: false
      },
      { isRead: true }
    );

    res.json({ message: 'Conversation marquée comme lue' });
  } catch (error) {
    console.error('Erreur lors du marquage comme lu:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour supprimer une conversation (suppression soft)
app.delete('/api/conversations/:id', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id,
      deletedBy: { $ne: req.user._id }  // Vérifier que l'utilisateur n'a pas déjà supprimé la conversation
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Marquer la conversation comme supprimée pour cet utilisateur
    if (!conversation.deletedBy.includes(req.user._id)) {
      conversation.deletedBy.push(req.user._id);
      await conversation.save();
    }

    // Vérifier si tous les participants ont supprimé la conversation
    const allParticipantsDeleted = conversation.participants.every(participantId => 
      conversation.deletedBy.some(deletedId => deletedId.toString() === participantId.toString())
    );

    if (allParticipantsDeleted) {
      // Si tous les participants ont supprimé, supprimer vraiment la conversation et ses messages
      await Message.deleteMany({ conversationId: req.params.id });
      await Conversation.findByIdAndDelete(req.params.id);
      console.log('Conversation vraiment supprimée car tous les participants l\'ont supprimée');
    } else {
      console.log('Conversation marquée comme supprimée pour l\'utilisateur', req.user._id);
    }

    res.json({ message: 'Conversation supprimée de votre côté' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la conversation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route de test pour vérifier la configuration
app.get('/api/test-google-config', (req, res) => {
  const config = {
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasSessionSecret: !!process.env.SESSION_SECRET,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pret_livre',
    nodeEnv: process.env.NODE_ENV || 'development'
  };
  
  console.log('Configuration Google OAuth:', config);
  res.json(config);
});

// Route pour mettre à jour les messages personnalisés
app.put('/api/user/messages-personnalises', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const { messageRetour, messageAcceptation, messageRefus } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user.messagesPersonnalises) {
      user.messagesPersonnalises = {};
    }
    
    if (messageRetour !== undefined) {
      user.messagesPersonnalises.messageRetour = messageRetour;
    }
    if (messageAcceptation !== undefined) {
      user.messagesPersonnalises.messageAcceptation = messageAcceptation;
    }
    if (messageRefus !== undefined) {
      user.messagesPersonnalises.messageRefus = messageRefus;
    }
    
    await user.save();
    
    res.json({ 
      message: 'Messages personnalisés mis à jour avec succès',
      messagesPersonnalises: user.messagesPersonnalises
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des messages:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour récupérer les messages personnalisés
app.get('/api/user/messages-personnalises', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const user = await User.findById(req.user._id);
    res.json({ messagesPersonnalises: user.messagesPersonnalises || {} });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur backend démarré sur le port ${PORT}`);
}); 