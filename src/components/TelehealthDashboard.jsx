import React, { useState } from 'react';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  ExternalLink, 
  ShieldCheck, 
  Play, 
  History,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Wifi,
  Mic,
  Camera,
  Activity,
  HeartPulse
} from 'lucide-react';
import { motion } from 'framer-motion';
import './TelehealthDashboard.css';

const UPCOMING_SESSIONS = [
  { id: 1, patient: 'John Doe', time: '10:30 AM', status: 'In Waiting Room', type: 'Tumor Board Follow-up', avatar: 'JD' },
  { id: 2, patient: 'Jane Smith', time: '11:15 AM', status: 'Scheduled', type: 'Chemo Review', avatar: 'JS' },
  { id: 3, patient: 'Robert Brown', time: '01:00 PM', status: 'Scheduled', type: 'Genomic Results', avatar: 'RB' },
];

const AVAILABLE_DOCTORS = [
  { id: 1, name: 'Dr. Sarah Smith', specialty: 'Senior Oncologist', status: 'Online', avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 2, name: 'Dr. James Wilson', specialty: 'Dermatology Expert', status: 'Online', avatar: 'https://i.pravatar.cc/150?u=james' },
  { id: 3, name: 'Dr. Emily Chen', specialty: 'Clinical Oncologist', status: 'Offline', avatar: 'https://i.pravatar.cc/150?u=emily' },
  { id: 4, name: 'Dr. Michael Brown', specialty: 'Dermatological Specialist', status: 'Online', avatar: 'https://i.pravatar.cc/150?u=michael' },
];

const TelehealthDashboard = ({ onStartCall, role }) => {
  const isDoctor = role === 'doctor';

  return (
    <div className="telehealth-dashboard">
      <div className="tele-header">
        <div className="tele-header-left">
          <h1>{isDoctor ? 'Carelinq Specialty Clinic' : 'Specialist Telehealth Portal'}</h1>
          <p>{isDoctor 
            ? 'Secure, encrypted meeting rooms for Oncology & Dermatology care.' 
            : 'Access your specialized care team for Oncology and Dermatology consultations.'}</p>
        </div>
        <div className="tele-stats">
          <div className="stat-pill">
            <span className="stat-value">{isDoctor ? '3' : '1'}</span>
            <span className="stat-label">{isDoctor ? 'Today' : 'Appointment Today'}</span>
          </div>
          <div className="stat-pill online">
            <span className="stat-dot"></span>
            <span className="stat-label">Network Secure</span>
          </div>
        </div>
      </div>

      <div className="tele-grid">
        {/* Main Action Card */}
        <div className={`tele-main-card ${!isDoctor ? 'patient-theme' : ''}`}>
          <div className="card-badge primary">E2EE Tunnel</div>
          <div className="main-card-content">
            <div className="icon-box">
              {isDoctor ? <Video size={32} color="white" /> : <HeartPulse size={32} color="white" />}
            </div>
            <div className="text-box">
              <h2>{isDoctor ? 'Instant Consultation' : 'Emergency Physician Connect'}</h2>
              <p>{isDoctor 
                ? 'Generate a secure P2P link and invite a patient immediately for a virtual visit.' 
                : 'Request an immediate secure connection with the duty oncology specialist.'}</p>
            </div>
            <button className={`${isDoctor ? 'start-btn' : 'start-btn patient'}`} onClick={() => onStartCall('video')}>
              {isDoctor ? <Plus size={20} /> : <Activity size={20} />}
              <span>{isDoctor ? 'Start Instant Room' : 'Request Consult Now'}</span>
            </button>
          </div>
          <div className="security-footer">
            <ShieldCheck size={14} />
            <span>HIPAA-Compliant Encrypted Tunnel Active</span>
          </div>
        </div>

        {/* Dynamic List Card */}
        <div className="tele-side-card">
          <div className="side-card-header">
            <h3>
                {isDoctor ? <Calendar size={18} /> : <Stethoscope size={18} />} 
                {isDoctor ? 'Upcoming Consults' : 'Available Specialists'}
            </h3>
            <button className="text-link">{isDoctor ? 'View Schedule' : 'Find Doctor'}</button>
          </div>
          <div className="sessions-list">
            {isDoctor ? (
              UPCOMING_SESSIONS.map(session => (
                <div key={session.id} className="session-item">
                  <div className="session-avatar">{session.avatar}</div>
                  <div className="session-details">
                    <span className="patient-name">{session.patient}</span>
                    <div className="session-meta">
                      <span className="time"><Clock size={12} /> {session.time}</span>
                      <span className="type">• {session.type}</span>
                    </div>
                  </div>
                  <div className="session-actions">
                    {session.status === 'In Waiting Room' ? (
                      <button className="join-now-btn" onClick={() => onStartCall('video')}>
                        <Play size={14} fill="currentColor" /> Join
                      </button>
                    ) : (
                      <span className="scheduled-tag">{session.status}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              AVAILABLE_DOCTORS.map(doc => (
                <div key={doc.id} className="session-item">
                  <img src={doc.avatar} alt={doc.name} className="doc-avatar-img" />
                  <div className="session-details">
                    <span className="patient-name">{doc.name}</span>
                    <div className="session-meta">
                      <span className="type">{doc.specialty}</span>
                      <span className={`status-tag ${doc.status.toLowerCase()}`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                  <div className="session-actions">
                    <button 
                      className={`connect-btn ${doc.status === 'Offline' ? 'disabled' : ''}`}
                      disabled={doc.status === 'Offline'}
                      onClick={() => onStartCall('video')}
                    >
                      Connect
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {!isDoctor && (
        <div className="tele-setup-section">
            <div className="section-title">
                <Settings size={20} />
                <h2>Pre-Session Setup & Check</h2>
            </div>
            <div className="setup-grid">
                <div className="setup-card">
                    <div className="setup-icon blue"><Camera size={20} /></div>
                    <div className="setup-info">
                        <strong>Camera Check</strong>
                        <span>High definition enabled</span>
                    </div>
                    <div className="setup-status">Active</div>
                </div>
                <div className="setup-card">
                    <div className="setup-icon green"><Mic size={20} /></div>
                    <div className="setup-info">
                        <strong>Microphone Check</strong>
                        <span>Noise cancellation on</span>
                    </div>
                    <div className="setup-status">Active</div>
                </div>
                <div className="setup-card">
                    <div className="setup-icon purple"><Wifi size={20} /></div>
                    <div className="setup-info">
                        <strong>Internet Check</strong>
                        <span>Connection link stable</span>
                    </div>
                    <div className="setup-status">Excellent</div>
                </div>
            </div>
        </div>
      )}

      <div className="tele-secondary-section">
        <div className="section-title">
          <History size={20} />
          <h2>{isDoctor ? 'Recent Virtual Sessions' : 'My Session History'}</h2>
        </div>
        <div className="recent-grid">
            <div className="recent-card">
               <div className="recent-info">
                  <strong>{isDoctor ? 'Sarah Wilson' : 'Dr. Sarah Smith'}</strong>
                  <span>{isDoctor ? 'Jan 22, 2026 • 15:20 Duration' : 'Follow-up Consultation • Jan 22, 2026'}</span>
               </div>
               <div className="recent-status success">
                  <CheckCircle2 size={16} /> Completed
               </div>
            </div>
            <div className="recent-card">
               <div className="recent-info">
                  <strong>{isDoctor ? 'Michael Lee' : 'Dr. James Wilson'}</strong>
                  <span>{isDoctor ? 'Jan 21, 2026 • 24:10 Duration' : 'Initial Assessment • Jan 21, 2026'}</span>
               </div>
               <div className="recent-status success">
                  <CheckCircle2 size={16} /> Completed
               </div>
            </div>
            <div className="recent-card">
               <div className="recent-info">
                  <strong>{isDoctor ? 'Patient Unavailable' : 'Missed Consultation'}</strong>
                  <span>Jan 21, 2026 • {isDoctor ? '00:00 Duration' : 'Dr. Emily Chen'}</span>
               </div>
               <div className="recent-status cancelled">
                  <AlertCircle size={16} /> {isDoctor ? 'No Show' : 'Rescheduled'}
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// Mock Settings icon since it was used but not imported
const Settings = ({ size }) => {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}

export default TelehealthDashboard;
