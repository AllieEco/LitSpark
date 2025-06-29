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
  
  // Disponibilité
  disponible: { type: Boolean, default: true }
});

module.exports = mongoose.model('Book', BookSchema); 