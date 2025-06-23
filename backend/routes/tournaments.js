const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const authMiddleware = require('../middleware/authMiddleware');


// ✅ Create a new tournament
// router.post('/', async (req, res) => {
//   const { name } = req.body;
//   try {
//     const newTournament = new Tournament({ name, players: [], rounds: [] });
//     await newTournament.save();
//     res.status(201).json(newTournament);
//   } catch (err) {
//     console.error('Error creating tournament:', err);
//     res.status(500).json({ msg: 'Failed to create tournament' });
//   }
// });
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const tournament = new Tournament({ name, user: req.user.id });
    await tournament.save();
    res.status(201).json(tournament);
  } catch (err) {
    console.error('Error creating tournament:', err);
    res.status(500).json({ msg: 'Failed to create tournament' });
  }
});


// get all tournament list
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tournaments = await Tournament.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tournaments);
  } catch (err) {
    console.error('Error fetching tournaments:', err);
    res.status(500).json({ msg: 'Server error fetching tournaments' });
  }
});
// ✅ Get a specific tournament by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ msg: 'Tournament not found' });
    res.json(tournament);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error fetching tournament' });
  }
});

// ✅ Add player to a tournament

router.post('/:id/players', authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ msg: 'Player name is required' });

  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ msg: 'Tournament not found' });

    const existingPlayer = tournament.players.find(p => p.name === name);
    if (existingPlayer) {
      return res.status(400).json({ msg: 'Player already exists in this tournament' });
    }

    tournament.players.push({ name });
    await tournament.save();

    res.json(tournament);
  } catch (err) {
    console.error('❌ Error adding player:', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});



// PUT /api/tournaments/:id/round/:roundNumber/scores
router.put('/:id/round/:roundNumber/scores', async (req, res) => {
  try {
    const { id, roundNumber } = req.params;
    const { scores } = req.body; // Expected: [{ p1Id, p2Id, p1Score, p2Score }]

    const tournament = await Tournament.findById(id);
    if (!tournament) return res.status(404).json({ msg: 'Tournament not found' });

    const round = tournament.rounds[roundNumber - 1];
    if (!round) return res.status(404).json({ msg: 'Round not found' });

    // Update scores
    scores.forEach(({ p1Id, p2Id, p1Score, p2Score }) => {
      const p1 = tournament.players.id(p1Id);
      const p2 = tournament.players.id(p2Id);

      if (p1) p1.score += parseFloat(p1Score);
      if (p2) p2.score += parseFloat(p2Score);
    });

    await tournament.save();
    res.json(tournament);
  } catch (err) {
    console.error('Error updating scores:', err);
    res.status(500).json({ msg: 'Error updating scores' });
  }
});

// DELETE player
router.delete('/:id/players/:playerId', authMiddleware, async (req, res) => {
  const { id, playerId } = req.params;
  try {
    const tournament = await Tournament.findById(id);
    tournament.players = tournament.players.filter(p => p._id.toString() !== playerId);
    await tournament.save();
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ msg: 'Error deleting player' });
  }
});

// PUT update player
router.put('/:id/players/:playerId', authMiddleware, async (req, res) => {
  const { id, playerId } = req.params;
  const { name, score } = req.body;
  try {
    const tournament = await Tournament.findById(id);
    const player = tournament.players.id(playerId);
    if (!player) return res.status(404).json({ msg: 'Player not found' });

    if (name) player.name = name;
    if (typeof score === 'number') player.score = score;

    await tournament.save();
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ msg: 'Error updating player' });
  }
});


// Update tournament name
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const updated = await Tournament.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error updating tournament' });
  }
});

// Delete tournament
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Tournament.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Tournament deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error deleting tournament' });
  }
});






module.exports = router;
