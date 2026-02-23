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
  AlertCircle
} from 'lucide-react';
import './TelehealthDashboard.css';

const UPCOMING_SESSIONS = [
  { id: 1, patient: 'John Doe', time: '10:30 AM', status: 'In Waiting Room', type: 'Tumor Board Follow-up', avatar: 'JD' },
  { id: 2, patient: 'Jane Smith', time: '11:15 AM', status: 'Scheduled', type: 'Chemo Review', avatar: 'JS' },
  { id: 3, patient: 'Robert Brown', time: '01:00 PM', status: 'Scheduled', type: 'Genomic Results', avatar: 'RB' },
];

const TelehealthDashboard = ({ onStartCall }) => {
  return (
    <div className="telehealth-dashboard">
      <div className="tele-header">
        <div className="tele-header-left">
          <h1>OncoLink Virtual Clinic</h1>
          <p>Secure, oncology-specialized meeting rooms for cancer care.</p>
        </div>
        <div className="tele-stats">
          <div className="stat-pill">
            <span className="stat-value">3</span>
            <span className="stat-label">Today</span>
          </div>
          <div className="stat-pill online">
            <span className="stat-dot"></span>
            <span className="stat-label">Engine Ready</span>
          </div>
        </div>
      </div>

      <div className="tele-grid">
        {/* Main Action Card */}
        <div className="tele-main-card">
          <div className="card-badge primary">New P2P Link</div>
          <div className="main-card-content">
            <div className="icon-box">
              <Video size={32} color="white" />
            </div>
            <div className="text-box">
              <h2>Instant Consultation</h2>
              <p>Generate a secure P2P link and invite a patient immediately for a virtual visit.</p>
            </div>
            <button className="start-btn" onClick={() => onStartCall('video')}>
              <Plus size={20} />
              <span>Start Instant Room</span>
            </button>
          </div>
          <div className="security-footer">
            <ShieldCheck size={14} />
            <span>End-to-End Encrypted Tunnel Active</span>
          </div>
        </div>

        {/* Schedule Preview */}
        <div className="tele-side-card">
          <div className="side-card-header">
            <h3><Calendar size={18} /> Upcoming Consults</h3>
            <button className="text-link">View Schedule</button>
          </div>
          <div className="sessions-list">
            {UPCOMING_SESSIONS.map(session => (
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
            ))}
          </div>
        </div>
      </div>

      <div className="tele-secondary-section">
        <div className="section-title">
          <History size={20} />
          <h2>Recent Virtual Sessions</h2>
        </div>
        <div className="recent-grid">
            <div className="recent-card">
               <div className="recent-info">
                  <strong>Sarah Wilson</strong>
                  <span>Jan 22, 2026 • 15:20 Duration</span>
               </div>
               <div className="recent-status success">
                  <CheckCircle2 size={16} /> Completed
               </div>
            </div>
            <div className="recent-card">
               <div className="recent-info">
                  <strong>Michael Lee</strong>
                  <span>Jan 21, 2026 • 24:10 Duration</span>
               </div>
               <div className="recent-status success">
                  <CheckCircle2 size={16} /> Completed
               </div>
            </div>
            <div className="recent-card">
               <div className="recent-info">
                  <strong>Patient Unavailable</strong>
                  <span>Jan 21, 2026 • 00:00 Duration</span>
               </div>
               <div className="recent-status cancelled">
                  <AlertCircle size={16} /> No Show
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TelehealthDashboard;
