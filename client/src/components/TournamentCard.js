import React from 'react';
import { Link } from 'react-router-dom';

const TournamentCard = ({ tournament }) => {
  return (
    <div className="card mb-3">
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <h5 className="card-title mb-1">{tournament.name}</h5>
          <p className="card-text">
            Players: {tournament.players?.length || 0} | Rounds: {tournament.rounds?.length || 0}
          </p>
        </div>
        <Link to={`/tournament/${tournament._id}`} className="btn btn-primary">
          View
        </Link>
      </div>
    </div>
  );
};

export default TournamentCard;
