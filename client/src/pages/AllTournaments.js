import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';

const AllTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState('');

  const fetchTournaments = async () => {
    try {
      const res = await API.get('/tournaments');
      setTournaments(res.data);
    } catch (err) {
      console.error('Error loading tournaments:', err);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const startEditing = (id, currentName) => {
    setEditingId(id);
    setEditedName(currentName);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedName('');
  };

  const saveEdit = async (id) => {
    try {
      await API.put(`/tournaments/${id}`, { name: editedName });
      cancelEditing();
      fetchTournaments();
    } catch (err) {
      console.error('Error updating tournament:', err);
    }
  };

  const deleteTournament = async (id) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await API.delete(`/tournaments/${id}`);
        fetchTournaments();
      } catch (err) {
        console.error('Error deleting tournament:', err);
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>All Tournaments</h2>
      {tournaments.length === 0 ? (
        <p>No tournaments found.</p>
      ) : (
        <ul className="list-group">
          {tournaments.map((t, index) => (
            <li
              key={t._id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {editingId === t._id ? (
                <>
                  <input
                    type="text"
                    className="form-control me-2"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                  <button
                    className="btn btn-sm btn-success me-2"
                    onClick={() => saveEdit(t._id)}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span>
                    <strong>{index + 1}.</strong>{' '}
                    <Link to={`/all-rounds/${t._id}`} className="text-decoration-none">
                      {t.name}
                    </Link>
                  </span>
                  <div>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => startEditing(t._id, t.name)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteTournament(t._id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AllTournaments;
