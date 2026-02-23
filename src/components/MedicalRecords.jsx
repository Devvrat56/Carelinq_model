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
  ExternalLink
} from 'lucide-react';
import './MedicalRecords.css';

const MOCK_RECORDS = [
  {
    id: 1,
    patientName: 'John Doe',
    date: '2026-02-22',
    time: '10:30 AM',
    duration: '15m 20s',
    summary: 'Discussed recent chest CT results. Lung Adenocarcinoma showing slight response to targeted therapy. Patient reporting mild fatigue but stable overall. Staging remains T2aN1M0.',
    tags: ['Lung Cancer', 'CT Review', 'Targeted Therapy'],
    doctor: 'Dr. Sarah Connor'
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    date: '2026-02-21',
    time: '11:15 AM',
    duration: '24m 10s',
    summary: 'Chemotherapy cycle 3 review. Neutrophil count is stable. Adjusted dosage for next infusion due to reported nausea. Scheduled follow-up blood work for Monday.',
    tags: ['Breast Cancer', 'Chemo Review', 'Dosage Adjust'],
    doctor: 'Dr. Sarah Connor'
  },
  {
    id: 3,
    patientName: 'Robert Brown',
    date: '2026-02-15',
    time: '01:00 PM',
    duration: '12m 45s',
    summary: 'Post-biopsy follow-up. Confirmed Multiple Myeloma diagnosis. Discussed initial treatment plan involving bortezomib and dexamethasone. Patient counseling provided regarding bone health.',
    tags: ['Myeloma', 'Initial Diagnosis', 'Treatment Plan'],
    doctor: 'Dr.Sarah Connor'
  },
  {
    id: 4,
    patientName: 'Emily White',
    date: '2026-02-14',
    time: '09:00 AM',
    duration: '18m 05s',
    summary: 'Routine monitoring. Glioblastoma stable on current maintenance medication. MRI scheduled for next month. No new neurological symptoms reported.',
    tags: ['Glioblastoma', 'Stable', 'Routine'],
    doctor: 'Dr. Sarah Connor'
  }
];

const MedicalRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeGroup, setTimeGroup] = useState('All');

  const filteredRecords = MOCK_RECORDS.filter(record => {
    const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         record.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Simple logic to group by "This Week" and "Older"
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);

  const thisWeek = filteredRecords.filter(r => new Date(r.date) >= oneWeekAgo);
  const older = filteredRecords.filter(r => new Date(r.date) < oneWeekAgo);

  const RecordCard = ({ record }) => (
    <div className="record-card">
      <div className="record-card-main">
        <div className="record-icon">
          <FileText size={20} />
        </div>
        <div className="record-info">
          <div className="record-header-row">
            <span className="patient-name">{record.patientName}</span>
            <span className="record-time-stamp">
              <Calendar size={14} /> {new Date(record.date).toLocaleDateString()} • {record.time}
            </span>
          </div>
          <p className="record-summary">{record.summary}</p>
          <div className="record-tags">
            {record.tags.map(tag => (
              <span key={tag} className="tag-pill">{tag}</span>
            ))}
          </div>
          <div className="record-meta-footer">
            <span className="duration"><Clock size={14} /> {record.duration}</span>
            <span className="physician"><User size={14} /> {record.doctor}</span>
          </div>
        </div>
      </div>
      <div className="record-actions">
        <button className="view-transcript-btn">
          Full Transcript <ChevronRight size={16} />
        </button>
        <button className="download-record-btn" title="Export PDF">
          <Download size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="medical-records-container">
      <div className="records-header">
        <div className="header-text">
          <h1>Clinical Encounter Summaries</h1>
          <p>AI-generated oncology consultation logs and patient history.</p>
        </div>
        <div className="header-controls">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by patient or clinical summary..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-pill-group">
            <button className="filter-pill active">All Records</button>
            <button className="filter-pill">My Sessions</button>
            <button className="filter-pill"><Filter size={16} /> Filter</button>
          </div>
        </div>
      </div>

      <div className="records-timeline">
        {thisWeek.length > 0 && (
          <div className="timeline-section">
            <h2 className="section-divider"><span>Recent Clinical Encounters (This Week)</span></h2>
            <div className="records-list">
              {thisWeek.map(record => <RecordCard key={record.id} record={record} />)}
            </div>
          </div>
        )}

        {older.length > 0 && (
          <div className="timeline-section">
            <h2 className="section-divider"><span>Post-Consultation Archives</span></h2>
            <div className="records-list">
              {older.map(record => <RecordCard key={record.id} record={record} />)}
            </div>
          </div>
        )}

        {filteredRecords.length === 0 && (
          <div className="no-records-found">
            <Activity size={48} />
            <h3>No records found</h3>
            <p>Try adjusting your search terms or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecords;
