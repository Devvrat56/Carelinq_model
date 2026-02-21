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

const Sidebar = () => {
  const items = [
    { icon: Activity, label: 'Activity' },
    { icon: MessageSquare, label: 'Consults', active: true },
    { icon: Users, label: 'Patients' },
    { icon: ClipboardList, label: 'Records' },
    { icon: Video, label: 'Telehealth' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
           <HeartPulse size={28} color="#10b981" />
        </div>
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className={`sidebar-item ${item.active ? 'active' : ''}`}>
              <Icon size={22} />
              <span>{item.label}</span>
            </div>
          );
        })}
        <div className="sidebar-item">
          <MoreHorizontal size={22} />
          <span>More</span>
        </div>
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-item">
          <Settings size={22} />
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
