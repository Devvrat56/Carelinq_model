import React, { useState } from 'react';
import { Search, Filter, UserPlus, Plus, UserSearch } from 'lucide-react';
import './ChatList.css';

const ChatList = ({ activeChat, onSelectChat, chats, onAddCandidate }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const handleAddChat = (e) => {
    e.preventDefault();
    if (newEmail) {
      onAddCandidate(newEmail);
      setNewEmail('');
      setShowAdd(false);
    }
  };

  return (
    <div className="chat-list medical">
      <div className="chat-list-header">
        <div className="chat-list-title">
          <h2>Consultations</h2>
          <div className="header-actions">
            <button className="add-candidate-btn med-add-btn" onClick={() => setShowAdd(!showAdd)}>
              <UserPlus size={18} />
              <span>Add Patient</span>
            </button>
          </div>
        </div>
        
        {showAdd ? (
          <form onSubmit={handleAddChat} className="add-chat-form">
            <input 
              type="email" 
              placeholder="patient-email@address.com" 
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              autoFocus
            />
            <button type="submit"><Plus size={16} /></button>
          </form>
        ) : (
          <div className="search-bar">
            <Search size={16} />
            <input type="text" placeholder="Search patient or ID" />
          </div>
        )}
      </div>
      
      <div className="chats-container">
        {chats.map((chat) => (
          <div 
            key={chat.id} 
            className={`chat-list-item ${activeChat === chat.id ? 'active' : ''}`}
            onClick={() => onSelectChat(chat)}
          >
            <div className="avatar-container">
               <img src={chat.avatar} alt={chat.name} className="avatar" />
               <div className="status-indicator online"></div>
            </div>
            <div className="chat-info">
              <div className="chat-info-top">
                <span className="chat-name">{chat.name}</span>
                <span className="chat-time">{chat.time}</span>
              </div>
              <p className="last-msg">{chat.lastMsg}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
