import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateTournament from './pages/CreateTournament';
import ViewTournament from './pages/ViewTournament';
import AllTournaments from './pages/AllTournaments';
import AllRounds from './pages/AllRounds';

const App = () => {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={isLoggedIn ? <Home /> : <Login />} />
        
        
        <Route
          path="/create"
          element={isLoggedIn ? <CreateTournament /> : <Login />}
        />
        <Route
          path="/tournament/:id"
          element={isLoggedIn ? <ViewTournament /> : <Login />}
        />
        <Route
          path="/all-tournaments"
          element={isLoggedIn ? <AllTournaments /> : <Login />}
        />
        <Route
          path="/all-rounds/:id"
          element={isLoggedIn ? <AllRounds /> : <Login />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
