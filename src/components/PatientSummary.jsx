import React, { useState } from 'react';
import { 
  User, 
  Activity, 
  Calendar, 
  FileText, 
  Droplet, 
  Heart, 
  Thermometer, 
  Wind, 
  ShieldCheck, 
  AlertCircle,
  Download,
  ExternalLink,
  ChevronRight,
  Pill,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import './PatientSummary.css';

const PatientSummary = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [healthStats, setHealthStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const doctorName = user?.name || "Dr. Specialist";

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health-status/${user.email}`);
        if (response.ok) {
          const data = await response.json();
          setHealthStats(data);
        }
      } catch (err) {
        console.error("Health fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.email) fetchHealth();
  }, [user]);

  const patient = {
    id: 'CL-1004',
    name: healthStats?.name || user?.name || user?.email?.split('@')[0] || 'Patient',
    age: 52,
    gender: 'Male',
    email: user?.email,
    phone: '+1 234-567-8901',
    status: 'Stable',
    condition: 'Stage 2 Lung Adenocarcinoma',
    avatar: user?.avatar || 'https://i.pravatar.cc/150?u=johndoe',
    lastVitals: {
      heartRate: healthStats?.heart_rate || 72,
      oxygen: healthStats?.oxygen_level || 98,
      steps: healthStats?.steps || 8432,
      temperature: '98.6°F',
      bloodPressure: '120/80',
      glucose: '95 mg/dL'
    },
    history: [
      { id: 1, event: 'Diagnosis: Stage 2 Lung Adenocarcinoma', date: '2025-05-15', doctor: doctorName },
      { id: 2, event: 'Chemo Cycle 1 Completed', date: '2025-07-20', doctor: doctorName },
      { id: 3, event: 'Follow-up CT Scan (Stable)', date: '2025-11-10', doctor: 'Radiology Team' },
      { id: 4, event: 'Chemo Cycle 2 Started', date: '2026-02-01', doctor: doctorName },
    ],
    medications: [
      { name: 'Cisplatin', dosage: '50mg/m²', frequency: 'Once every 3 weeks', status: 'Active' },
      { name: 'Pemetrexed', dosage: '500mg/m²', frequency: 'Once every 3 weeks', status: 'Active' },
      { name: 'Ondansetron', dosage: '8mg', frequency: 'As needed for nausea', status: 'As Needed' },
    ]
  };

  if (isLoading) return <div className="loading-summary">Syncing Clinical Data...</div>;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      className="patient-summary-v2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="summary-header">
        <div className="patient-profile-top">
          <div className="profile-main">
            <div className="avatar-wrapper">
              <img src={patient.avatar} alt={patient.name} />
              <div className="status-indicator online"></div>
            </div>
            <div className="profile-info">
              <div className="name-row">
                <h1>{patient.name}</h1>
                <span className={`status-badge ${patient.status.toLowerCase()}`}>{patient.status}</span>
              </div>
              <div className="meta-row">
                <span>{patient.id}</span>
                <span className="separator">•</span>
                <span>{patient.age} years old</span>
                <span className="separator">•</span>
                <span>{patient.gender}</span>
              </div>
              <div className="condition-pill">
                <ShieldCheck size={14} />
                <span>{patient.condition}</span>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-secondary"><Download size={16} /> Export EMR</button>
            <button className="btn-primary"><Calendar size={16} /> Schedule Session</button>
          </div>
        </div>
      </div>

      <div className="summary-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          Clinical Overview
        </button>
        <button 
          className={activeTab === 'vitals' ? 'active' : ''} 
          onClick={() => setActiveTab('vitals')}
        >
          Vitals & BioData
        </button>
        <button 
          className={activeTab === 'history' ? 'active' : ''} 
          onClick={() => setActiveTab('history')}
        >
          Medical History
        </button>
        <button 
          className={activeTab === 'meds' ? 'active' : ''} 
          onClick={() => setActiveTab('meds')}
        >
          Medications
        </button>
      </div>

      <div className="summary-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div className="grid-left">
              <div className="card vitals-snapshot">
                <h3><Activity size={18} /> Vital Signs Snapshot</h3>
                <div className="vitals-mini-grid">
                  <div className="vital-box">
                    <Heart size={20} className="icon-heart" />
                    <label>Heart Rate</label>
                    <span>{patient.lastVitals.heartRate} <small>BPM</small></span>
                  </div>
                  <div className="vital-box">
                    <Wind size={20} className="icon-oxygen" />
                    <label>SpO2</label>
                    <span>{patient.lastVitals.oxygen}%</span>
                  </div>
                  <div className="vital-box">
                    <Thermometer size={20} className="icon-temp" />
                    <label>Temp</label>
                    <span>{patient.lastVitals.temperature}</span>
                  </div>
                  <div className="vital-box">
                    <Droplet size={20} className="icon-bp" />
                    <label>B.P.</label>
                    <span>{patient.lastVitals.bloodPressure}</span>
                  </div>
                </div>
              </div>

              <div className="card clinical-judgment">
                <h3><FileText size={18} /> Physician's Clinical Narrative</h3>
                <p>
                  Patient is showing high compliance with Chemotherapy Cycle 2. Lung capacity has improved by 12% since the last pulmonary function test. 
                  Minimal side effects reported through AI Symptom tracker. Recommend proceeding with the full administration of Cisplatin.
                </p>
                <div className="judgment-footer">
                  <span className="updated">Last updated: 2 hours ago</span>
                  <button className="edit-link">Edit Note <ChevronRight size={14} /></button>
                </div>
              </div>
            </div>

            <div className="grid-right">
              <div className="card alerts-card">
                <h3><AlertCircle size={18} /> Active Care Alerts</h3>
                <div className="alerts-list">
                  <div className="alert-item warning">
                    <div className="alert-icon"><Clock size={16} /></div>
                    <div className="alert-text">
                      <strong>CT Scan Overdue</strong>
                      <span>Scheduled for last Tuesday, patient missed the slot.</span>
                    </div>
                  </div>
                  <div className="alert-item info">
                    <div className="alert-icon"><ShieldCheck size={16} /></div>
                    <div className="alert-text">
                      <strong>Lab Results Ready</strong>
                      <span>CBC results from 2026-03-12 are uploaded.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card quick-contacts">
                <h3>Quick Contact</h3>
                <div className="contact-btns">
                  <button className="contact-item">
                    <Mail size={16} />
                    <span>Email Patient</span>
                  </button>
                  <button className="contact-item">
                    <ExternalLink size={16} />
                    <span>Video Bridge</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="vitals-detailed-view">
            <div className="vitals-chart-placeholder">
              <div className="chart-header">
                <h3>Heart Rate & Oxygen Level History (7 Days)</h3>
                <div className="legend">
                  <span className="legend-item"><span className="dot bpm"></span> BPM</span>
                  <span className="legend-item"><span className="dot spo2"></span> SpO2</span>
                </div>
              </div>
              <div className="mock-chart-vignette">
                {/* Visual representation of a chart */}
                <div className="chart-bars">
                  {[65, 72, 68, 75, 82, 78, 74].map((h, i) => (
                    <div key={i} className="chart-bar-group">
                      <div className="bar-bpm" style={{ height: `${h}%` }}></div>
                      <div className="bar-spo2" style={{ height: `${98}%` }}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-timeline">
            {patient.history.map((item, index) => (
              <motion.div 
                key={item.id} 
                className="timeline-entry"
                variants={itemVariants}
              >
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="entry-header">
                    <span className="entry-date">{item.date}</span>
                    <span className="entry-doctor">{item.doctor}</span>
                  </div>
                  <p className="entry-event">{item.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'meds' && (
          <div className="medications-grid">
            {patient.medications.map((med, index) => (
              <div key={index} className="med-card">
                <div className="med-header">
                  <Pill size={24} className="med-icon" />
                  <div className="med-title">
                    <h4>{med.name}</h4>
                    <span className={`status ${med.status.toLowerCase()}`}>{med.status}</span>
                  </div>
                </div>
                <div className="med-details">
                  <div className="detail">
                    <label>Dosage</label>
                    <p>{med.dosage}</p>
                  </div>
                  <div className="detail">
                    <label>Frequency</label>
                    <p>{med.frequency}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PatientSummary;
