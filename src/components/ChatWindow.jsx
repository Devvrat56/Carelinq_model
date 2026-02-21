import React, { useState, useRef, useEffect } from 'react';
import { 
  Phone, 
  Video, 
  Info, 
  Send, 
  Paperclip, 
  Smile, 
  MoreHorizontal, 
  Shield, 
  FileText, 
  Download,
  Image as ImageIcon
} from 'lucide-react';
import './ChatWindow.css';

const ChatWindow = ({ chat, messages, onSendMessage, onStartCall }) => {
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Limit file size for P2P demo (500KB for Base64 efficiency)
    if (file.size > 500000) {
      alert("For secure P2P speed, please limit attachments to 500KB (PDFs/Images).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      onSendMessage(`Sent a file: ${file.name}`, false, {
        name: file.name,
        type: file.type,
        data: base64Data
      });
    };
    reader.readAsDataURL(file);
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
            <div key={msg.id} className={`message-wrapper ${msg.sender} ${msg.isSystem ? 'system' : ''}`}>
              <div className="message-bubble">
                {/* File Attachment Rendering */}
                {msg.fileData && (
                   <div className="attachment-preview">
                     {msg.fileType?.startsWith('image/') ? (
                        <img src={msg.fileData} alt="attachment" className="img-attachment" />
                     ) : (
                        <div className="file-attachment">
                           <FileText size={24} />
                           <span>{msg.fileName}</span>
                        </div>
                     )}
                     <a href={msg.fileData} download={msg.fileName} className="download-btn">
                       <Download size={14} /> Download
                     </a>
                   </div>
                )}
                
                {/* Render Text with Link Support */}
                <p>
                  {msg.text.split(/(https?:\/\/[^\s]+)/g).map((part, i) => 
                    part.match(/^https?:\/\//) ? (
                      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="chat-link">
                        {part}
                      </a>
                    ) : part
                  )}
                </p>

                {/* Specialized 'Join Consult' Button for Jitsi Links */}
                {msg.isSystem && msg.text.includes('meet.jit.si') && (
                  <button 
                    className="join-meeting-pill"
                    onClick={() => {
                        const room = msg.text.split('meet.jit.si/')[1];
                        window.open(`https://meet.jit.si/${room}`, '_blank');
                    }}
                  >
                    Enter Consultation Room
                  </button>
                )}
                
                <div className="msg-meta">
                   <span className="msg-time">{msg.time}</span>
                   {msg.sender === 'me' && !msg.isSystem && <span className="read-receipt">✓ Delivered</span>}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area medical-input">
        <div className="input-toolbar">
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx"
          />
          <button title="Attach Lab Report" onClick={() => fileInputRef.current.click()}>
            <Paperclip size={18} />
          </button>
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
