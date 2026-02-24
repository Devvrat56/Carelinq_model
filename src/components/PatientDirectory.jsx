import React, { useState } from 'react';
import { Search, UserPlus, Mail, Phone, Calendar, MoreVertical, Filter, ArrowUpDown } from 'lucide-react';
import './PatientDirectory.css';

const PATIENTS_DATA = [
  { id: 1, name: 'John Doe', email: 'john.doe@oncocare.com', phone: '+1 234-567-8901', lastVisit: '2025-10-15', status: 'Active', condition: 'Lung Adenocarcinoma' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@oncocare.com', phone: '+1 234-567-8902', lastVisit: '2025-11-20', status: 'Pending', condition: 'Breast Cancer (Stage II)' },
  { id: 3, name: 'Robert Brown', email: 'robert.b@oncocare.com', phone: '+1 234-567-8903', lastVisit: '2025-09-12', status: 'Active', condition: 'Multiple Myeloma' },
  { id: 4, name: 'Emily White', email: 'emily.w@oncocare.com', phone: '+1 234-567-8904', lastVisit: '2025-12-05', status: 'Active', condition: 'Glioblastoma' },
  { id: 5, name: 'Michael Lee', email: 'm.lee@oncocare.com', phone: '+1 234-567-8905', lastVisit: '2025-08-30', status: 'Inactive', condition: 'Ovarian Carcinoma' },
  { id: 6, name: 'Sarah Wilson', email: 's.wilson@oncocare.com', phone: '+1 234-567-8906', lastVisit: '2026-01-10', status: 'Active', condition: 'Hodgkin Lymphoma' },
];

const PatientDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredPatients = PATIENTS_DATA.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="patient-directory">
      <div className="directory-header">
        <div className="header-left">
          <h1>Carelinq Patient Center</h1>
          <p>Longitudinal oncology care and clinical trial management.</p>
        </div>
        <button className="add-patient-btn">
          <UserPlus size={18} />
          <span>Onboard New Oncology Case</span>
        </button>
      </div>

      <div className="directory-controls">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name, email or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <div className="filter-select">
            <Filter size={16} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button className="sort-btn">
            <ArrowUpDown size={16} />
            <span>Sort</span>
          </button>
        </div>
      </div>

      <div className="directory-table-container">
        <table className="directory-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Contact Details</th>
              <th>Condition</th>
              <th>Last Visit</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="patient-row">
                <td>
                  <div className="patient-name-cell">
                    <div className="patient-avatar">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="patient-name-info">
                      <span className="name">{patient.name}</span>
                      <span className="id">#CL-{1000 + patient.id}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="contact-cell">
                    <div className="contact-item">
                      <Mail size={14} /> {patient.email}
                    </div>
                    <div className="contact-item">
                      <Phone size={14} /> {patient.phone}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="condition-tag">{patient.condition}</span>
                </td>
                <td>
                  <div className="date-cell">
                    <Calendar size={14} />
                    {new Date(patient.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </td>
                <td>
                  <span className={`status-pill ${patient.status.toLowerCase()}`}>
                    {patient.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPatients.length === 0 && (
          <div className="no-results">
            <Search size={48} />
            <h3>No patients found</h3>
            <p>Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDirectory;
