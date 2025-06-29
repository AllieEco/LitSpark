const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, sparse: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  username: { 
    type: String, 
    unique: true, 
    sparse: true,
    validate: {
      validator: function(v) {
        return !/\s/.test(v); // Vérifie qu'il n'y a pas d'espaces
      },
      message: "Le nom d'utilisateur ne peut pas contenir d'espaces"
    }
  },
  displayName: { type: String },
  nom: { type: String, default: '' },
  prenom: { type: String, default: '' },
  adresseLigne1: { type: String, default: '' },
  adresseLigne2: { type: String, default: '' },
  codePostal: { type: String, default: '' },
  ville: { type: String, default: '' },
  telephone: { type: String, default: '' },
  profilePhotoUrl: { type: String, default: '' },
  stats: {
    empruntes: { type: Number, default: 0 },
    pretes: { type: Number, default: 0 },
    misesEnPret: { type: Number, default: 0 }
  }
});

// Méthode pour vérifier si l'utilisateur utilise Google
UserSchema.methods.isGoogleUser = function() {
  return !!this.googleId;
};

// Méthode pour vérifier le mot de passe
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Middleware pour hasher le mot de passe avant la sauvegarde
UserSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', UserSchema); 