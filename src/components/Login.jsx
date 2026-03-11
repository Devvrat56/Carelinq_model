import React, { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, Lock, Activity, ChevronRight, User, Stethoscope, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('doctor'); // 'doctor' or 'patient'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPassword = password.trim();
    
    try {
      // In a real scenario, you would point this to your backend API URL
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          password: sanitizedPassword,
          role: role
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Successful login
        // Log activity to MongoDB
        try {
          await fetch(`${API_BASE_URL}/api/timestamp/log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_email: sanitizedEmail,
              action: `User logged in as ${role}`
            })
          });
        } catch (logErr) {
          console.error("Failed to log activity:", logErr);
        }

        setTimeout(() => {
          onLogin(data.user); // Using the user object from backend
          setIsLoading(false);
        }, 800);
      } else {
        setError(data.message || 'Invalid credentials. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      // FALLBACK FOR DEMO: If backend isn't running yet, we can keep the old local logic or show error
      // Letting user know they need the backend
      setError('Connection to security server failed. Ensure backend is running.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="login-header">
          <motion.div 
            className="med-logo-container"
            style={{ 
              background: role === 'doctor' 
                ? 'linear-gradient(135deg, var(--med-primary), var(--med-primary-dark))' 
                : 'linear-gradient(135deg, var(--med-accent), #059669)' 
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {role === 'doctor' ? (
              <Stethoscope size={40} color="white" strokeWidth={2.5} />
            ) : (
              <User size={40} color="white" strokeWidth={2.5} />
            )}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {role === 'doctor' ? 'Carelinq Doctor' : 'Carelinq Patient'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {role === 'doctor' 
              ? 'Oncology & Dermatology Specialized Telehealth' 
              : 'Secure Patient Access & Medical History Portal'}
          </motion.p>
        </div>

        <div className="role-switcher-container">
          <div className={`role-switcher ${role}`}>
            <div className="role-glider"></div>
            <button 
              type="button"
              className={`role-btn ${role === 'doctor' ? 'active' : ''}`}
              onClick={() => { setRole('doctor'); setError(''); }}
            >
              <Stethoscope size={16} /> Doctor
            </button>
            <button 
              type="button"
              className={`role-btn ${role === 'patient' ? 'active' : ''}`}
              onClick={() => { setRole('patient'); setError(''); }}
            >
              <User size={16} /> Patient
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AlertCircle size={16} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            className="input-container"
            key={role + "-email"} // Change key to trigger re-animation
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label>{role === 'doctor' ? 'Professional Email' : 'Patient ID / Email'}</label>
            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                placeholder={role === 'doctor' ? 'doctor@gmail.com' : 'patient@gmail.com'} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </motion.div>

          <motion.div 
            className="input-container"
            key={role + "-pass"}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label>Secure Passphrase</label>
            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button 
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </motion.div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot?</a>
          </div>
          
          <motion.button 
            type="submit" 
            className="login-btn"
            style={{ 
              background: role === 'doctor' 
                ? 'linear-gradient(135deg, var(--med-primary), var(--med-primary-dark))' 
                : 'linear-gradient(135deg, var(--med-accent), #059669)',
              boxShadow: role === 'doctor'
                ? '0 10px 15px -3px rgba(14, 165, 233, 0.4)'
                : '0 10px 15px -3px rgba(16, 185, 129, 0.4)'
            }}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Activity size={20} />
              </motion.div>
            ) : (
              <>
                {role === 'doctor' ? 'Access Secure Dashboard' : 'Open Patient Portal'} <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        <motion.div 
          className="login-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="trust-badge">
            <ShieldCheck size={16} />
            <span>HIPAA-Compliant Protocol Active</span>
          </div>
          <ChevronRight size={14} color="#334155" />
          <div className="demo-hint" title="Demo: doctor@gmail.com / patient@gmail.com (pass: test@123)">
             Credentials Hint
          </div>
          <ChevronRight size={14} color="#334155" />
          <span>v2.4.1</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
