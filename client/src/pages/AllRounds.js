import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import API from '../utils/api';

const AllRounds = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [editPlayerId, setEditPlayerId] = useState(null);
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerScore, setEditPlayerScore] = useState('');
  const [scoreChanges, setScoreChanges] = useState({});

  const fetchTournament = useCallback(async () => {
    try {
      const res = await API.get(`/tournaments/${id}`);
      setTournament(res.data);
    } catch (err) {
      console.error('Error fetching tournament:', err);
      setError('Unable to load tournament data.');
    }
  }, [id]);

  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  const addPlayer = async () => {
    if (!playerName) return;
    try {
      await API.post(`/tournaments/${id}/players`, { name: playerName });
      setPlayerName('');
      fetchTournament();
    } catch (err) {
      console.error('Error adding player:', err);
      setError('Failed to add player.');
    }
  };

  const deletePlayer = async (playerId) => {
    try {
      await API.delete(`/tournaments/${id}/players/${playerId}`);
      fetchTournament();
    } catch (err) {
      console.error('Error deleting player:', err);
    }
  };

  const startEditPlayer = (player) => {
    setEditPlayerId(player._id);
    setEditPlayerName(player.name);
    setEditPlayerScore(player.score);
  };

  const cancelEdit = () => {
    setEditPlayerId(null);
    setEditPlayerName('');
    setEditPlayerScore('');
  };

  const updatePlayer = async () => {
    try {
      await API.put(`/tournaments/${id}/players/${editPlayerId}`, {
        name: editPlayerName,
        score: parseFloat(editPlayerScore)
      });
      cancelEdit();
      fetchTournament();
    } catch (err) {
      console.error('Error updating player:', err);
    }
  };

  const generateRound = async () => {
    try {
      await API.post(`/swiss/${id}/next-round`);
      fetchTournament();
    } catch (err) {
      console.error('Error generating round:', err);
    }
  };

  const handleScoreChange = (roundNum, playerId, value) => {
    setScoreChanges((prev) => ({
      ...prev,
      [roundNum]: {
        ...(prev[roundNum] || {}),
        [playerId]: parseFloat(value)
      }
    }));
  };

  const submitRoundScores = async (roundNumber) => {
    const changes = scoreChanges[roundNumber];
    if (!changes) return;

    const payload = Object.entries(changes).map(([playerId, score]) => ({
      playerId,
      score
    }));

    try {
      await API.post(`/swiss/${id}/submit-scores`, {
        roundNumber,
        scores: payload
      });
      const updated = { ...scoreChanges };
      delete updated[roundNumber];
      setScoreChanges(updated);
      fetchTournament();
    } catch (err) {
      console.error('Error submitting scores:', err);
    }
  };

  if (!tournament) {
    return <div className="container mt-4">Loading tournament...</div>;
  }

  const sortedPlayers = [...tournament.players].sort((a, b) => b.score - a.score);

  return (
    <div className="container mt-4">
      <h2>{tournament.name} - All Rounds</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Add Player */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Player Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="form-control"
        />
        <button className="btn btn-success mt-2" onClick={addPlayer}>
          Add Player
        </button>
        <button className="btn btn-warning mt-2 ms-2" onClick={generateRound}>
          Generate Round
        </button>
      </div>

      {/* Players List */}
      <h4>Players (sorted by score):</h4>
      <ul className="list-group">
        {sortedPlayers.map((p) => (
          <li className="list-group-item d-flex justify-content-between align-items-center" key={p._id}>
            {editPlayerId === p._id ? (
              <>
                <input
                  className="form-control me-2"
                  value={editPlayerName}
                  onChange={(e) => setEditPlayerName(e.target.value)}
                />
                <input
                  className="form-control me-2"
                  type="number"
                  step="0.5"
                  value={editPlayerScore}
                  onChange={(e) => setEditPlayerScore(e.target.value)}
                />
                <button className="btn btn-sm btn-primary me-2" onClick={updatePlayer}>Save</button>
                <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <span>{p.name} - {p.score} pts</span>
                <div>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => startEditPlayer(p)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => deletePlayer(p._id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Rounds Section */}
      <h4 className="mt-4">Rounds:</h4>
      {tournament.rounds?.map((r) => (
        <div key={r._id || r.number} className="card mt-3">
          <div className="card-body">
            <h5 className="card-title">Round {r.number}</h5>
            <ul className="list-group">
              {r.pairings?.map((pair, idx) => (
                <li className="list-group-item" key={idx}>
                  <div className="d-flex justify-content-between">
                    {pair.p1?.name || 'BYE'} vs {pair.p2?.name || 'BYE'}
                  </div>
                  <div className="d-flex gap-3 mt-2">
                    {pair.p1 && (
                      <div>
                        <label>{pair.p1.name} score:</label>
                        <input
                          type="number"
                          step="0.5"
                          value={scoreChanges[r.number]?.[pair.p1._id] ?? pair.p1.score}
                          onChange={(e) => handleScoreChange(r.number, pair.p1._id, e.target.value)}
                          className="form-control"
                        />
                      </div>
                    )}
                    {pair.p2 && (
                      <div>
                        <label>{pair.p2.name} score:</label>
                        <input
                          type="number"
                          step="0.5"
                          value={scoreChanges[r.number]?.[pair.p2._id] ?? pair.p2.score}
                          onChange={(e) => handleScoreChange(r.number, pair.p2._id, e.target.value)}
                          className="form-control"
                        />
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <button
              className="btn btn-primary mt-3"
              onClick={() => submitRoundScores(r.number)}
            >
              Submit Scores
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllRounds;
