const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  // Informations de base
  titre: { type: String, required: true },
  auteur: { type: String, required: true },
  isbn: { type: String },
  editeur: { type: String },
  anneePublication: { type: Number },
  genre: { type: String },
  nombrePages: { type: Number },
  
  // Description
  resume: { type: String },
  etat: { type: String, default: 'Bon' },
  imageUrl: { type: String },
  
  // Propriétaire
  proprietaire: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  proprietaireNom: { type: String, required: true },
  
  // Dates
  dateAjout: { type: Date, default: Date.now },
  
  // Système de prêt amélioré
  statut: { 
    type: String, 
    enum: ['disponible', 'reserve', 'prete', 'indisponible'], 
    default: 'disponible' 
  },
  
  // Informations sur la demande de prêt actuelle
  demandePret: {
    demandeur: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    dateDemande: { type: Date },
    dateExpiration: { type: Date }, // La réservation expire après 48h
    statut: { 
      type: String, 
      enum: ['en_attente', 'acceptee', 'refusee', 'expiree'], 
      default: 'en_attente' 
    }
  },
  
  // Informations sur le prêt actuel (si le livre est prêté)
  pretActuel: {
    emprunteur: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    dateDebut: { type: Date },
    dateFinPrevue: { type: Date },
    dateRetourEffective: { type: Date },
    prolongations: { type: Number, default: 0 }
  },
  
  // Disponibilité (conservé pour compatibilité)
  disponible: { type: Boolean, default: true }
});

// Middleware pour synchroniser le champ disponible avec le statut
BookSchema.pre('save', function(next) {
  this.disponible = this.statut === 'disponible';
  next();
});

// Méthode pour réserver un livre
BookSchema.methods.reserver = function(demandeurId) {
  if (this.statut !== 'disponible') {
    throw new Error('Ce livre n\'est pas disponible pour la réservation');
  }
  
  this.statut = 'reserve';
  this.demandePret = {
    demandeur: demandeurId,
    dateDemande: new Date(),
    dateExpiration: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
    statut: 'en_attente'
  };
};

// Méthode pour accepter une demande de prêt
BookSchema.methods.accepterPret = function(dureeJours = 14) {
  if (this.statut !== 'reserve' || this.demandePret.statut !== 'en_attente') {
    throw new Error('Aucune demande de prêt en attente');
  }
  
  this.statut = 'prete';
  this.demandePret.statut = 'acceptee';
  this.pretActuel = {
    emprunteur: this.demandePret.demandeur,
    dateDebut: new Date(),
    dateFinPrevue: new Date(Date.now() + dureeJours * 24 * 60 * 60 * 1000),
    prolongations: 0
  };
};

// Méthode pour refuser une demande de prêt
BookSchema.methods.refuserPret = function() {
  if (this.statut !== 'reserve' || this.demandePret.statut !== 'en_attente') {
    throw new Error('Aucune demande de prêt en attente');
  }
  
  this.statut = 'disponible';
  this.demandePret.statut = 'refusee';
};

// Méthode pour retourner un livre
BookSchema.methods.retournerLivre = function() {
  if (this.statut !== 'prete') {
    throw new Error('Ce livre n\'est pas actuellement prêté');
  }
  
  this.statut = 'disponible';
  this.pretActuel.dateRetourEffective = new Date();
  
  // Archiver les informations de prêt
  this.pretActuel = {};
  this.demandePret = {};
};

module.exports = mongoose.model('Book', BookSchema); 