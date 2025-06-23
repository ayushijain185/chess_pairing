const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  opponents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player', // References other players this player has faced
    },
  ],
  receivedBye: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);
