import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const roles = ['USER', 'ADMIN', 'STAFF'];

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setRole('USER');
    setError('');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/auth/signin' : '/auth/signup';
    const payload = isLogin
      ? { username, password }
      : { username, password, role };

    try {
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = isLogin ? await response.json() : await response.text();


      if (!response.ok) {
        setError(data.message || (isLogin ? 'Invalid credentials' : 'Signup failed'));
        return;
      }

      if (isLogin) {
        localStorage.setItem('token', data.token);

        const profileRes = await fetch('http://localhost:8080/api/users/me', {
          headers: { Authorization: `Bearer ${data.token}` },
        });

        if (profileRes.ok) {
          const profile = await profileRes.json();
          localStorage.setItem('role', profile.role);
          navigate('/dashboard');
        } else {
          setError('Failed to fetch user profile');
        }
      } else {
        alert('Signup successful! Please log in.');
        setIsLogin(true);
        resetForm();
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Server error. Try again later.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="text-center mb-4">{isLogin ? 'Login' : 'Sign Up'} to Lost & Found</h3>
        <form onSubmit={handleAuth}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {!isLogin && (
            <div className="mb-3">
              <select
                className="form-select"
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                {roles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className="btn btn-primary w-100">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </form>
        <div className="text-center mt-3">
          {isLogin ? (
            <p>
              Don’t have an account?{' '}
              <button className="btn btn-link p-0" onClick={() => { setIsLogin(false); resetForm(); }}>
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button className="btn btn-link p-0" onClick={() => { setIsLogin(true); resetForm(); }}>
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
