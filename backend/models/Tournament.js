const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, default: 0 },
  receivedBye: { type: Boolean, default: false },
  opponents: [String] // Optional: could store opponent names or IDs
});

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  players: [playerSchema], // embedded subdocuments
  rounds: [
    {
      number: Number,
      pairings: [
        {
          p1: {
            _id: mongoose.Schema.Types.ObjectId,
            name: String,
            score: Number,
          },
          p2: {
            _id: mongoose.Schema.Types.ObjectId,
            name: String,
            score: Number,
          },
        },
      ],
    }
  ],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);
