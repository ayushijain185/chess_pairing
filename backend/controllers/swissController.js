const Tournament = require('../models/Tournament');
const Player = require('../models/Player');
const Round = require('../models/Round');

function canPair(p1, p2) {
  return !p1.opponents.includes(p2._id.toString());
}

const generateSwissRound = async (tournamentId) => {
  const players = await Player.find({ tournament: tournamentId }).sort({ score: -1 });
  const used = new Set();
  const pairings = [];

  if (players.length % 2 !== 0) {
    const byePlayer = players.find(p => !p.receivedBye);
    if (byePlayer) {
      byePlayer.score += 1;
      byePlayer.receivedBye = true;
      await byePlayer.save();
      used.add(byePlayer._id.toString());
      pairings.push({ p1: byePlayer._id, p2: null });
    }
  }

  for (let i = 0; i < players.length; i++) {
    const p1 = players[i];
    if (used.has(p1._id.toString())) continue;

    for (let j = i + 1; j < players.length; j++) {
      const p2 = players[j];
      if (used.has(p2._id.toString())) continue;

      if (canPair(p1, p2)) {
        p1.opponents.push(p2._id);
        p2.opponents.push(p1._id);
        await p1.save();
        await p2.save();
        used.add(p1._id.toString());
        used.add(p2._id.toString());
        pairings.push({ p1: p1._id, p2: p2._id });
        break;
      }
    }
  }

  const tournament = await Tournament.findById(tournamentId).populate('rounds');
  const roundNumber = tournament.rounds.length + 1;
  const newRound = new Round({
    tournament: tournamentId,
    number: roundNumber,
    pairings
  });

  await newRound.save();
  tournament.rounds.push(newRound);
  await tournament.save();

  return newRound;
};

module.exports = { generateSwissRound };
