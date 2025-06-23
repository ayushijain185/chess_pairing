const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');

// POST /swiss/:id/next-round
router.post('/:id/next-round', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ msg: 'Tournament not found' });

    const players = [...tournament.players].sort((a, b) => b.score - a.score); // Sort by score
    const used = new Set();
    const pairings = [];

    for (let i = 0; i < players.length; i++) {
      if (used.has(i)) continue;

      let paired = false;
      for (let j = i + 1; j < players.length; j++) {
        if (used.has(j)) continue;

        // Pair players i and j
        pairings.push({
          p1: {
            _id: players[i]._id,
            name: players[i].name,
            score: players[i].score
          },
          p2: {
            _id: players[j]._id,
            name: players[j].name,
            score: players[j].score
          }
        });

        used.add(i);
        used.add(j);
        paired = true;
        break;
      }

      if (!paired) {
        // No one left to pair with → give a BYE
        pairings.push({
          p1: {
            _id: players[i]._id,
            name: players[i].name,
            score: players[i].score
          },
          p2: null
        });

        // Give 1 point for BYE
        players[i].score += 1;

        // Update player score in tournament.players
        const playerInTournament = tournament.players.id(players[i]._id);
        if (playerInTournament) playerInTournament.score = players[i].score;

        used.add(i);
      }
    }

    const newRound = {
      number: tournament.rounds.length + 1,
      pairings
    };

    tournament.rounds.push(newRound);
    await tournament.save();

    res.json(tournament);
  } catch (err) {
    console.error('❌ Error generating round:', err);
    res.status(500).json({ msg: 'Server error generating round' });
  }
});




// POST /api/swiss/:id/submit-scores
router.post('/:id/submit-scores', async (req, res) => {
  const { roundNumber, scores } = req.body;
  try {
    const t = await Tournament.findById(req.params.id);
    if (!t) return res.status(404).json({ msg: 'Tournament not found' });

    const round = t.rounds.find(r => r.number === roundNumber);
    if (!round) return res.status(404).json({ msg: 'Round not found' });

    // Update player scores
    scores.forEach(({ playerId, score }) => {
      const p = t.players.id(playerId);
      if (p) p.score = score;
    });

    await t.save();
    res.json(t);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error submitting scores' });
  }
});


module.exports = router;
