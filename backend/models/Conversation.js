const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageDate: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  bookInfo: {
    titre: String,
    auteur: String,
    imageUrl: String,
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    }
  },
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

// Index composé pour rechercher les conversations d'un utilisateur
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageDate: -1 });

// Méthode pour incrémenter le compteur de messages non lus
conversationSchema.methods.incrementUnreadCount = function(userId) {
  const currentCount = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), currentCount + 1);
};

// Méthode pour réinitialiser le compteur de messages non lus
conversationSchema.methods.resetUnreadCount = function(userId) {
  this.unreadCount.set(userId.toString(), 0);
};

// Méthode pour obtenir l'autre participant dans une conversation
conversationSchema.methods.getOtherParticipant = function(currentUserId) {
  return this.participants.find(p => p.toString() !== currentUserId.toString());
};

module.exports = mongoose.model('Conversation', conversationSchema); 