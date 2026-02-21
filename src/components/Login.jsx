import React, { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      onLogin(email.trim());
    }
  };

  return (
    <div className="login-overlay medical">
      <div className="login-card">
        <div className="login-header">
          <div className="med-logo-container">
            <HeartPulse size={48} color="var(--med-primary)" />
          </div>
          <h1>MediLink Portal</h1>
          <p>Secure Medical Telehealth & Real-time Scribe</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <Mail size={20} className="input-icon" />
            <input 
              type="email" 
              placeholder="doctor@hospital.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="login-btn med-btn">
            Enter Dashboard <ArrowRight size={18} />
          </button>
        </form>

        <div className="login-footer">
          <ShieldCheck size={14} color="#10b981" />
          <span>HIPAA-Compliant Encrypted Channel Active</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
