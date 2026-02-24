import React from 'react';
import { 
  Activity,
  MessageSquare, 
  Users, 
  ClipboardList, 
  Video, 
  MoreHorizontal, 
  Settings,
  HeartPulse
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeTab, onTabChange }) => {
  const mainItems = [
    { icon: Activity, label: 'Activity', id: 'activity' },
    { icon: MessageSquare, label: 'Consults', id: 'consults' },
    { icon: Users, label: 'Patients', id: 'patients' },
    { icon: ClipboardList, label: 'Records', id: 'records' },
    { icon: Video, label: 'Telehealth', id: 'telehealth' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
           <img src="/oncology.svg" alt="Carelinq Logo" style={{ width: '32px', height: '32px' }} />
        </div>
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div 
              key={item.id} 
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </div>
          );
        })}
        <div 
          className={`sidebar-item ${activeTab === 'more' ? 'active' : ''}`}
          onClick={() => onTabChange('more')}
        >
          <MoreHorizontal size={22} />
          <span>More</span>
        </div>
      </div>
      <div className="sidebar-bottom">
        <div 
          className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onTabChange('settings')}
        >
          <Settings size={22} />
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
