import React from 'react';
import { 
  Users, 
  Calendar, 
  Activity, 
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  Stethoscope,
  Award,
  Zap,
  ChevronRight,
  TrendingDown,
  Mail,
  Smartphone,
  ShieldCheck,
  Droplet,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import './ActivityDashboard.css';

const ActivityDashboard = ({ role }) => {
  const isDoctor = role === 'doctor';

  const healthData = [
    { day: 'Mon', value: 65 },
    { day: 'Tue', value: 58 },
    { day: 'Wed', value: 72 },
    { day: 'Thu', value: 68 },
    { day: 'Fri', value: 75 },
    { day: 'Sat', value: 82 },
    { day: 'Sun', value: 78 },
  ];

  // DOCTOR PRACTICE DASHBOARD
  if (isDoctor) {
    return (
      <div className="activity-dashboard-v2 doctor-view">
        {/* Sidebar: Physician Overview */}
        <div className="activity-sidebar">
          <div className="side-profile-card">
            <div className="side-avatar-box">
               <img src="https://i.pravatar.cc/150?u=doctor" alt="Doctor" />
               <div className="side-status-dot online"></div>
            </div>
            <h2>Dr. Sarah Smith</h2>
            <span className="side-id-tag">Oncology & Dermatology Lead</span>
            
            <div className="clinical-tags">
               <span className="c-tag oncology">Specialist</span>
               <span className="c-tag verified">Board Verified</span>
            </div>
          </div>

          <div className="side-details-list">
             <h3>Today's Practice Stats</h3>
             <div className="s-detail-item">
                <Users size={14} className="text-blue" />
                <div>
                   <label>Total Patients Today</label>
                   <span>18 Cases Scheduled</span>
                </div>
             </div>
             <div className="s-detail-item">
                <Calendar size={14} className="text-orange" />
                <div>
                   <label>Upcoming Surgeries</label>
                   <span>2 Dermatological Procedures</span>
                </div>
             </div>
             <div className="s-detail-item">
                <Clock size={14} className="text-green" />
                <div>
                   <label>Average Wait Time</label>
                   <span>8 Minutes</span>
                </div>
             </div>
             <div className="s-detail-item">
                <FileText size={14} className="text-purple" />
                <div>
                   <label>Pending Transcripts</label>
                   <span>4 Encounters to Sign</span>
                </div>
             </div>
          </div>

          <div className="sidebar-action-group">
            <button className="side-action-btn primary">View Clinic Calendar</button>
            <button className="side-action-btn secondary">Admin Reports</button>
          </div>
        </div>

        {/* Main: Clinical Performance & Patient Queue */}
        <div className="activity-main">
          <div className="vitals-strip">
            <div className="v-strip-box performance">
               <Zap size={20} className="doctor-icon" />
               <div className="v-strip-info">
                  <span className="v-lbl">Clinical Efficiency</span>
                  <span className="v-val">96 <small>%</small></span>
               </div>
            </div>
            <div className="v-strip-box patients">
               <Users size={20} />
               <div className="v-strip-info">
                  <span className="v-lbl">Active Referrals</span>
                  <span className="v-val">12 <small>New</small></span>
               </div>
            </div>
            <div className="v-strip-box revenue">
               <TrendingUp size={20} />
               <div className="v-strip-info">
                  <span className="v-lbl">Case Resolution</span>
                  <span className="v-val">88 <small>%</small></span>
               </div>
            </div>
            <div className="v-strip-box quality">
               <Award size={20} />
               <div className="v-strip-info">
                  <span className="v-lbl">Patient Rating</span>
                  <span className="v-val">4.9 <small>/ 5</small></span>
               </div>
            </div>
          </div>

          <div className="trends-section">
             <div className="trends-header">
                <div className="t-title-box">
                   <h3><Activity size={18} /> Clinic Patient Load Analysis</h3>
                   <p>Daily patient volume and consultation intensity over 7 days.</p>
                </div>
                <div className="t-status finalized">
                   <ShieldCheck size={16} /> Data Updated 1m ago
                </div>
             </div>

             <div className="trends-vis doctor-vis">
                {healthData.map((data, i) => (
                  <div key={i} className="vis-col">
                    <motion.div 
                      className="vis-bar doctor-bar"
                      initial={{ height: 0 }}
                      animate={{ height: `${data.value}%` }}
                      transition={{ delay: i * 0.05, duration: 0.5 }}
                    >
                       <div className="vis-tooltip">{data.value} Patients</div>
                    </motion.div>
                    <span className="vis-lbl">{data.day}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="bottom-meta-grid">
             <div className="meta-timeline">
                <h3>Today's Patient Queue</h3>
                <div className="m-timeline-item doc-item">
                   <div className="m-t-dot success"></div>
                   <div className="m-t-info">
                      <strong>Johnathan Doe (Oncology)</strong>
                      <span>Stability: 98% • Ready for Consultation in Room 3</span>
                   </div>
                   <ChevronRight size={14} />
                </div>
                <div className="m-timeline-item doc-item">
                   <div className="m-t-dot alert"></div>
                   <div className="m-t-info">
                      <strong>Emily White (Dermatology)</strong>
                      <span>Acute Rash Follow-up • Check Images in Records</span>
                   </div>
                   <ChevronRight size={14} />
                </div>
             </div>

             <div className="meta-security-card doctor-card">
                <div className="sec-icon"><Stethoscope size={32} /></div>
                <h4>Practice Efficiency Guard</h4>
                <p>Clinic operations are running at peak performance. AI Assistant is managing <strong>12 queue inquiries</strong> automatically.</p>
                <div className="last-sync">Daily Target: 25 Patients</div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // PATIENT WELLNESS DASHBOARD
  return (
    <div className="activity-dashboard-v2 patient-view">
      <div className="activity-sidebar">
        <div className="side-profile-card">
          <div className="side-avatar-box">
             <img src="https://i.pravatar.cc/150?u=johndoe" alt="Me" />
             <div className="side-status-dot online"></div>
          </div>
          <h2>Johnathan Doe</h2>
          <span className="side-id-tag">Patient ID: #CL-1004 • Stable</span>
          
          <div className="care-rating">
             <Award size={14} className="text-gold" />
             <span>Active Care Journey</span>
          </div>
        </div>

        <div className="side-details-list">
           <h3>My Health Goals</h3>
           <div className="s-detail-item wellness">
              <Droplet size={14} className="text-blue" />
              <div>
                 <label>Hydration</label>
                 <span>2.5L Target • 1.8L Done</span>
              </div>
           </div>
           <div className="s-detail-item wellness">
              <Activity size={14} className="text-orange" />
              <div>
                 <label>Daily Activity</label>
                 <span>8,000 Steps Target</span>
              </div>
           </div>
           <div className="s-detail-item wellness">
              <CheckCircle2 size={14} className="text-green" />
              <div>
                 <label>Medication Schedule</label>
                 <span>Phase 2 • 100% On Track</span>
              </div>
           </div>
           <div className="s-detail-item wellness">
              <Smartphone size={14} />
              <div>
                 <label>AI Symptom Log</label>
                 <span>Last entry: Today, 8:00 AM</span>
              </div>
           </div>
        </div>

        <button className="side-action-btn patient-btn">
           Update Wellness Log
        </button>
      </div>

      <div className="activity-main">
        <div className="vitals-strip">
          <div className="v-strip-box heart-p">
             <Heart size={20} />
             <div className="v-strip-info">
                <span className="v-lbl">Heart Rate</span>
                <span className="v-val">72 <small>BPM</small></span>
             </div>
          </div>
          <div className="v-strip-box oxygen-p">
             <Wind size={20} />
             <div className="v-strip-info">
                <span className="v-lbl">SpO2</span>
                <span className="v-val">98 <small>%</small></span>
             </div>
          </div>
          <div className="v-strip-box steps-p">
             <Activity size={20} />
             <div className="v-strip-info">
                <span className="v-lbl">Live Steps</span>
                <span className="v-val">8,432 <small>Steps</small></span>
             </div>
          </div>
          <div className="v-strip-box mood-p">
             <Award size={20} />
             <div className="v-strip-info">
                <span className="v-lbl">Recovery</span>
                <span className="v-val">94 <small>%</small></span>
             </div>
          </div>
        </div>

        <div className="trends-section patient-trends">
           <div className="trends-header">
              <div className="t-title-box">
                 <h3><TrendingUp size={18} /> My Recovery Journey</h3>
                 <p>Tracking your clinical progress and wellness milestones.</p>
              </div>
              <div className="t-status wellness">
                 <CheckCircle2 size={16} /> Progressing Well
              </div>
           </div>

           <div className="trends-vis patient-vis">
              {healthData.map((data, i) => (
                <div key={i} className="vis-col">
                  <motion.div 
                    className="vis-bar patient-bar"
                    initial={{ height: 0 }}
                    animate={{ height: `${data.value}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                  >
                     <div className="vis-tooltip">Health {data.value}%</div>
                  </motion.div>
                  <span className="vis-lbl">{data.day}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="bottom-meta-grid">
           <div className="meta-timeline">
              <h3>My Recent Activity</h3>
              <div className="m-timeline-item p-item">
                 <div className="m-t-dot primary"></div>
                 <div className="m-t-info">
                    <strong>Weekly Oncology Review</strong>
                    <span>Completed yesterday • stable markers</span>
                 </div>
                 <ChevronRight size={14} />
              </div>
              <div className="m-timeline-item p-item">
                 <div className="m-t-dot info"></div>
                 <div className="m-t-info">
                    <strong>Carelinq AI Interaction</strong>
                    <span>Logged skin irritation protocols</span>
                 </div>
                 <ChevronRight size={14} />
              </div>
           </div>

           <div className="meta-security-card patient-card">
              <div className="sec-icon"><ShieldCheck size={32} /></div>
              <h4>Patient Privacy Center</h4>
              <p>Your data is end-to-end encrypted. Only your authorized Carelinq specialists can access this dashboard.</p>
              <div className="last-sync">Secure Sync Active</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDashboard;
