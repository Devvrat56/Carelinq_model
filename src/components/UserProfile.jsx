import React from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  LogOut, 
  ChevronRight, 
  Globe, 
  Lock,
  CreditCard,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import './UserProfile.css';

const UserProfile = ({ user, onLogout }) => {
  const isDoctor = user.role === 'doctor';

  const settingsGroups = [
    {
      title: 'Account Management',
      items: [
        { icon: User, label: 'Personal Information', sub: 'Manage your profile details and preferences' },
        { icon: Mail, label: 'Contact Preferences', sub: 'Control how we reach out to you' },
        { icon: Globe, label: 'Language & Region', sub: 'English (US), New York, GMT-5' }
      ]
    },
    {
      title: 'Security & Privacy',
      items: [
        { icon: Lock, label: 'Password & Security', sub: 'Update passphrase and 2FA settings' },
        { icon: Shield, label: 'Data & Privacy', sub: 'Manage your HIPAA-compliant data sharing' },
        { icon: FileCheck, label: 'Compliance Audit', sub: 'View access logs and security reports' }
      ]
    },
    {
      title: 'Subscription & Support',
      items: [
        { icon: CreditCard, label: isDoctor ? 'Oncology License' : 'Carelinq Plus', sub: isDoctor ? 'Professional Tier - Active' : 'Free Tier' },
        { icon: HelpCircle, label: 'Help & Knowledge Base', sub: 'Get assistance and view tutorials' }
      ]
    }
  ];

  return (
    <div className="user-profile-v2">
      <div className="profile-hero">
        <div className="hero-content">
          <div className="hero-avatar-wrapper">
            <img src={user.avatar} alt={user.name} className="hero-avatar" />
            <div className={`role-tag ${user.role}`}>{user.role}</div>
          </div>
          <div className="hero-text">
            <h1>{user.name}</h1>
            <p className="hero-email">{user.email}</p>
            <div className="hero-badges">
              <span className="badge"><Shield size={12} /> HIPAA Verified</span>
              <span className="badge"><Globe size={12} /> Active Sync</span>
            </div>
          </div>
        </div>
        <button className="profile-logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          <span>Terminate Session</span>
        </button>
      </div>

      <div className="settings-container-v2">
        {settingsGroups.map((group, idx) => (
          <motion.div 
            key={idx} 
            className="settings-group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <h3>{group.title}</h3>
            <div className="settings-items-list">
              {group.items.map((item, i) => (
                <div key={i} className="settings-card">
                  <div className="s-card-icon">
                    <item.icon size={20} />
                  </div>
                  <div className="s-card-text">
                    <span className="s-lbl">{item.label}</span>
                    <span className="s-sub">{item.sub}</span>
                  </div>
                  <ChevronRight size={18} className="s-arrow" />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="profile-footer-v2">
         <p>Protocol Version: 2.4.1 (Stable Build)</p>
         <p>© 2026 Carelinq Oncology & Dermatology. All rights reserved.</p>
      </div>
    </div>
  );
};

export default UserProfile;
