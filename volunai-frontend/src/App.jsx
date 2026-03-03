import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import ChatRequest from './pages/ChatRequest';
import RegisterVolunteer from './pages/RegisterVolunteer';
import Login from './pages/Login';
import Register from './pages/Register2';
import UserDashboard from './pages/UserDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/volunteer/*" element={<VolunteerDashboard />} />
        <Route path="/chat" element={<ChatRequest />} />
        <Route path="/register-volunteer" element={<RegisterVolunteer />} />
      </Routes>
    </Router>
  );
}

export default App;
