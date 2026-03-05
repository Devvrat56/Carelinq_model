import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  FileText, 
  ChevronRight, 
  Filter, 
  Download, 
  Activity,
  User,
  Clock,
  Video,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  FileSearch,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './MedicalRecords.css';

const MOCK_RECORDS = [
  {
    id: 1,
    patientName: 'Johnathan Doe',
    date: '2026-03-01',
    time: '02:30 PM',
    duration: 'N/A',
    type: 'discharge',
    status: 'finalized',
    priority: 'high',
    summary: 'DISCHARGE SUMMARY: Patient successfully completed cycle 4 of targeted chemotherapy. Stable vitals throughout stay. Prescribed maintenance oral medications. Follow-up localized imaging scheduled in 14 days.',
    tags: ['Cycle 4', 'Oncology', 'Discharge'],
    doctor: 'Inpatient Oncology Team',
    clinicalSignificance: 'Recovery milestones met. Monitoring for neuropathy.'
  },
  {
    id: 2,
    patientName: 'Johnathan Doe',
    date: '2026-02-28',
    time: '11:15 AM',
    duration: '18m 45s',
    type: 'video',
    status: 'signed',
    priority: 'medium',
    summary: 'VIDEO CONSULT SUMMARY: Discussed recovery progress and post-chemo side effects. Patient reporting improved appetite. Adjustments made to anti-nausea medication. Skin check performed via high-res video.',
    tags: ['Telehealth', 'Recovery', 'AI-Scribe'],
    doctor: 'Dr. Sarah Smith',
    clinicalSignificance: 'Appetite improving. Side effects manageable.'
  },
  {
    id: 3,
    patientName: 'Johnathan Doe',
    date: '2026-02-27',
    time: '09:00 PM',
    duration: 'Chatbot Session',
    type: 'chatbot',
    status: 'flagged',
    priority: 'low',
    summary: 'CHATBOT INTERACTION: Patient inquired about mild skin irritation. AI Assistant provided immediate soothing protocols and flagged for Dermatology review. Redness reported as localized and non-painful.',
    tags: ['AI Assistant', 'Incident Log', 'Dermatology'],
    doctor: 'Carelinq Health AI',
    clinicalSignificance: 'Potential dermatitis. Dermatologist notified.'
  },
  {
    id: 4,
    patientName: 'Jane Smith',
    date: '2026-02-14',
    time: '09:00 AM',
    duration: '15m 05s',
    type: 'discharge',
    status: 'finalized',
    priority: 'medium',
    summary: 'DISCHARGE SUMMARY: Post-surgical follow-up completed. Wound healing within expected parameters. No signs of infection. Clearance provided for light physical activity.',
    tags: ['Post-Op', 'Surgical', 'Healed'],
    doctor: 'Surgical Care Unit',
    clinicalSignificance: 'Primary incision site closed. No exudate.'
  },
  {
    id: 5,
    patientName: 'Robert Brown',
    date: '2026-02-12',
    time: '04:20 PM',
    duration: '22m',
    type: 'video',
    status: 'signed',
    priority: 'high',
    summary: 'ONCOLOGY REVIEW: Initial biopsy analysis discussion. Confirmed Multiple Myeloma markers. Discussed chemotherapy protocol and marrow support.',
    tags: ['Myeloma', 'Oncology', 'New Case'],
    doctor: 'Dr. Sarah Connor',
    clinicalSignificance: 'Bence-Jones proteins detected. Immediate start recommended.'
  }
];

const MedicalRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredRecords = MOCK_RECORDS.filter(record => {
    const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         record.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || record.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getRecordIcon = (type) => {
    switch(type) {
      case 'discharge': return <ShieldCheck size={20} />;
      case 'video': return <Video size={20} />;
      case 'chatbot': return <MessageSquare size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const getRecordTypeLabel = (type) => {
    switch(type) {
      case 'discharge': return 'Discharge Summary';
      case 'video': return 'Video Consult';
      case 'chatbot': return 'AI Health Assistant';
      default: return 'Clinical Record';
    }
  };

  const stats = [
    { label: 'Total Records', value: MOCK_RECORDS.length, icon: FileSearch, color: '#0ea5e9' },
    { label: 'AI Sessions', value: '14', icon: MessageSquare, color: '#a855f7' },
    { label: 'Virtual Consults', value: '8', icon: Video, color: '#3b82f6' },
    { label: 'Pending Sign', value: '2', icon: Clock, color: '#f59e0b' },
  ];

  return (
    <div className="medical-records-v2">
      <div className="records-layout-header">
        <div className="records-title-section">
           <h1>Clinical Repository</h1>
           <p>Intelligent archive of Oncology & Dermatology encounter data.</p>
        </div>
        
        <div className="records-stats-strip">
           {stats.map((stat, i) => (
             <div key={i} className="stat-pill">
                <stat.icon size={16} style={{ color: stat.color }} />
                <div className="stat-content">
                   <span className="stat-val">{stat.value}</span>
                   <span className="stat-lbl">{stat.label}</span>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="records-controls-v2">
         <div className="search-wrap-premium">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Filter by patient, condition, or clinical summary..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="records-tab-switcher">
            <button className={activeFilter === 'all' ? 'active' : ''} onClick={() => setActiveFilter('all')}>All</button>
            <button className={activeFilter === 'discharge' ? 'active' : ''} onClick={() => setActiveFilter('discharge')}>Discharge</button>
            <button className={activeFilter === 'video' ? 'active' : ''} onClick={() => setActiveFilter('video')}>Video</button>
            <button className={activeFilter === 'chatbot' ? 'active' : ''} onClick={() => setActiveFilter('chatbot')}>AI Bot</button>
         </div>
      </div>

      <div className="records-scroll-area">
        <div className="records-grid-v2">
          {filteredRecords.map((record, index) => (
            <motion.div 
              key={record.id} 
              className={`premium-record-card type-${record.type}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="p-record-header">
                <div className={`p-type-icon bg-${record.type}`}>
                  {getRecordIcon(record.type)}
                </div>
                <div className="p-header-info">
                   <span className="p-type-lbl">{getRecordTypeLabel(record.type)}</span>
                   <div className="p-patient-row">
                      <span className="p-name">{record.patientName}</span>
                      <div className={`p-status-pill ${record.status}`}>{record.status}</div>
                   </div>
                </div>
                <button className="p-more-btn"><ArrowUpRight size={18} /></button>
              </div>

              <div className="p-record-body">
                 <p className="p-summary">{record.summary}</p>
                 <div className="p-clinical-note">
                    <AlertCircle size={14} />
                    <span>{record.clinicalSignificance}</span>
                 </div>
              </div>

              <div className="p-record-tags">
                 {record.tags.map(tag => <span key={tag} className="v2-tag">#{tag}</span>)}
              </div>

              <div className="p-record-footer">
                <div className="footer-left">
                   <div className="footer-item"><Calendar size={13} /> {new Date(record.date).toLocaleDateString()}</div>
                   <div className="footer-item"><User size={13} /> {record.doctor}</div>
                </div>
                <div className="footer-actions">
                   <button className="pdf-btn" title="Export Secure PDF"><Download size={16} /></button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredRecords.length === 0 && (
            <div className="records-empty-state">
               <FileSearch size={64} />
               <h3>No clinical matches found</h3>
               <p>Refine your search parameters to find the specific patient encounter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;
