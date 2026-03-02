import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/volunteer/*" element={<VolunteerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
