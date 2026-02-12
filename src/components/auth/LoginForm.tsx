import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn(email, password);
    
    if (result?.error) {
      setError(result.error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Sales Performance Dashboard</h1>
        <p>Sign in to access your dashboard</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="demo-credentials">
          <h3>Demo Emails to login</h3>
          <p><strong>Automotive Supervisor:</strong> as@kazeworld.com</p>
          <p><strong>Banking Supervisor:</strong> bs@kazeworld.com</p>
          <p><strong>Automotive Executive:</strong> ce@kazeworld.com</p>
          <p><strong>Banking Executive:</strong> se@kazeworld.com</p>
        </div>
      </div>
    </div>
  );
}
