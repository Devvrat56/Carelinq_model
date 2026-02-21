import React, { useState } from 'react';
import { Phone, Video, Info, Send, Paperclip, Smile, MoreHorizontal, Users, Shield } from 'lucide-react';
import './ChatWindow.css';

const ChatWindow = ({ chat, messages, onSendMessage, onStartCall }) => {
  const [inputText, setInputText] = useState('');
  
  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!chat) {
    return (
      <div className="chat-window empty">
        <div className="empty-state-content">
          <div className="empty-icon-circle medical">
            <Shield size={48} color="var(--med-primary)" />
          </div>
          <h2>Secure Healthcare Messenger</h2>
          <p>Please select a consultation or add a patient using their email address to begin a secure real-time session.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="avatar-container-sm">
             <img src={chat.avatar} alt={chat.name} className="avatar-sm" />
             <div className="status-indicator online"></div>
          </div>
          <div>
            <h3>{chat.name}</h3>
            <span className="status">Patient • Secure Channel</span>
          </div>
        </div>
        <div className="chat-header-actions">
          <button onClick={() => onStartCall('audio')} title="Start Audio Consult" className="med-action-btn">
            <Phone size={20} />
          </button>
          <button onClick={() => onStartCall('video')} title="Start Video Consult" className="med-action-btn primary">
            <Video size={20} />
          </button>
          <div className="divider"></div>
          <button title="Case Details">
            <Info size={20} />
          </button>
        </div>
      </div>
      
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="no-messages">
            <div className="secure-badge">
               <Shield size={14} /> Registered Secure Consultation Channel
            </div>
            <p>New consultation started. You can now exchange medical information securely.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
              <div className="message-bubble">
                <p>{msg.text}</p>
                <div className="msg-meta">
                   <span className="msg-time">{msg.time}</span>
                   {msg.sender === 'me' && <span className="read-receipt">✓ Delivered</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chat-input-area medical-input">
        <div className="input-toolbar">
          <button title="Attach Lab Report"><Paperclip size={18} /></button>
          <button title="Quick Response"><Smile size={18} /></button>
          <button title="More Options"><MoreHorizontal size={18} /></button>
        </div>
        <div className="input-container">
          <textarea 
            placeholder={`Send secure message to ${chat.name}...`} 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button className="send-btn medical" disabled={!inputText.trim()} onClick={handleSend}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
