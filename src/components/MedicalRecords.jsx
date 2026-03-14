import React, { useState, useEffect } from 'react';
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
import { API_BASE_URL } from '../config';
import './MedicalRecords.css';

// Initial state for fallback if backend is empty
const INITIAL_MOCK_RECORDS = [
  {
    id: 'rec_001',
    type: 'discharge',
    patientName: 'Johnathan Doe',
    status: 'signed',
    summary: 'Patient discharged after successful stage 2 chemotherapy cycle. All vital signs stable. Follow-up scheduled for 2 weeks.',
    clinicalSignificance: 'High - Post-chemo recovery phase started.',
    tags: ['Oncology', 'Chemotherapy', 'Discharge'],
    date: '2026-03-12T10:00:00Z',
    doctor: 'Dr. Sarah Smith'
  },
  {
    id: 'rec_002',
    type: 'video',
    patientName: 'Emily White',
    status: 'review',
    summary: 'Virtual dermatological assessment of acute rash on upper torso. Prescribed topical corticosteroids.',
    clinicalSignificance: 'Medium - Monitoring for allergic reaction.',
    tags: ['Dermatology', 'Telehealth', 'Rash'],
    date: '2026-03-13T14:30:00Z',
    doctor: 'Dr. Sarah Smith'
  },
  {
    id: 'rec_003',
    type: 'chatbot',
    patientName: 'Self (AI Assistant)',
    status: 'stable',
    summary: 'AI session: Patient queried about potential side effects of immunotherapy and diet restrictions.',
    clinicalSignificance: 'Routine - Patient education and symptom tracking.',
    tags: ['AI Assistant', 'Immunotherapy', 'Patient Education'],
    date: '2026-03-14T08:15:00Z',
    doctor: 'Carelinq AI'
  }
];

const MedicalRecords = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [records, setRecords] = useState(INITIAL_MOCK_RECORDS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true);
      try {
        // Fetch specific records for the logged in user from PostgreSQL via Backend
        const response = await fetch(`${API_BASE_URL}/api/records/${user.email}`);
        
        const displayName = user?.name || user?.email?.split('@')[0] || 'Patient';
        const personalizedMocks = INITIAL_MOCK_RECORDS.map(rec => ({
          ...rec,
          patientName: (rec.type === 'chatbot') ? `Self (${displayName})` : displayName
        }));

        if (response.ok) {
          const data = await response.json();
          // Merge backend records with personalized mock records
          setRecords([...data, ...personalizedMocks].filter((v,i,a)=>a.findIndex(t=>(t.id===v.id))===i));
        } else {
          console.error("Failed to load records from DB");
          setRecords(personalizedMocks);
        }
      } catch (err) {
        console.error("Database connection error:", err);
        const displayName = user?.name || user?.email?.split('@')[0] || 'Patient';
        setRecords(INITIAL_MOCK_RECORDS.map(rec => ({
          ...rec,
          patientName: (rec.type === 'chatbot') ? `Self (${displayName})` : displayName
        })));
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.email) {
      fetchRecords();
    }
  }, [user]);

  const filteredRecords = records.filter(record => {
    const matchesSearch = (record.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (record.summary || '').toLowerCase().includes(searchTerm.toLowerCase());
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
    { label: 'Total Records', value: records.length, icon: FileSearch, color: '#0ea5e9' },
    { label: 'AI Sessions', value: records.filter(r => r.type === 'chatbot').length, icon: MessageSquare, color: '#a855f7' },
    { label: 'Virtual Consults', value: records.filter(r => r.type === 'video').length, icon: Video, color: '#3b82f6' },
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
