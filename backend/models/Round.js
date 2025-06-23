const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
  },
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
  },
  pairings: [
    {
      p1: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
      p2: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
      result: {
        type: String, // e.g., "1-0", "0.5-0.5", "0-1", "bye"
        default: "",
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Round', roundSchema);
