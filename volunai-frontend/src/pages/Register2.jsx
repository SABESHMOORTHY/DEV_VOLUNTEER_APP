import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contactNumber: '',
    location: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.register(formData);
      navigate('/login');
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <div className="app-layout">
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 20px' }}>
        <div className="glass-card" style={{ maxWidth: 500, width: '100%', padding: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 16px', background: 'var(--gradient-primary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🤖</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Create Account</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Join VolunAI community</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid var(--accent-rose)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 24, color: 'var(--accent-rose)', fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="form-input"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="form-input"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="form-input"
                placeholder="Create a strong password"
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                className="form-input"
                placeholder="555-123-4567"
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="form-input"
                placeholder="City, State"
              />
            </div>

            <div className="form-group">
              <label>Account Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="form-select"
              >
                <option value="user">User (Request Services)</option>
                <option value="volunteer">Volunteer (Provide Services)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full btn-lg"
              style={{ marginTop: 8 }}
            >
              Create Account
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')} 
              style={{ background: 'none', border: 'none', color: 'var(--accent-purple-light)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
