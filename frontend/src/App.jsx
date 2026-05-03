import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/" />} />
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
