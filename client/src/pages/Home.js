import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import TournamentCard from '../components/TournamentCard';
import CreateTournament from './CreateTournament';

const Home = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/tournaments');
      setTournaments(res.data);
    } catch (err) {
      console.error('Error fetching tournaments:', err);
      setError('Failed to load tournaments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">All Tournaments</h2>

      <CreateTournament onCreate={fetchTournaments} />

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {loading ? (
        <p className="mt-3">Loading tournaments...</p>
      ) : tournaments.length === 0 ? (
        <p className="mt-3">No tournaments found. Create one!</p>
      ) : (
        <div className="row mt-3">
          {tournaments.map((tournament) => (
            <div className="col-md-4 mb-3" key={tournament._id}>
              <TournamentCard tournament={tournament} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
