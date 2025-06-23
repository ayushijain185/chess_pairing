import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const CreateTournament = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await API.post('/tournaments', { name });
      
      if (onCreate) onCreate(); // Refresh tournament list if callback provided
      setName('');
      alert('✅ Tournament created!');
      navigate(`/tournament/${res.data._id}`);
    } catch (err) {
      console.error('❌ Error creating tournament:', err);
      alert(err.response?.data?.msg || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create New Tournament</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="tournamentName">Tournament Name</label>
          <input
            id="tournamentName"
            type="text"
            className="form-control"
            placeholder="e.g. Summer Chess Open"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary mt-2"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
};

export default CreateTournament;
