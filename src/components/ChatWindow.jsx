import React, { useState, useRef, useEffect } from 'react';
import { 
  Phone, 
  Video as VideoIcon, 
  Info, 
  Send, 
  Paperclip, 
  Smile, 
  MoreHorizontal, 
  Shield, 
  FileText, 
  Download,
  Mic,
  Square,
  Check,
  ArrowLeft,
  X as CloseIcon,
  Stethoscope
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import './ChatWindow.css';

const ChatWindow = ({ chat, messages, onSendMessage, onStartCall, onBackToList }) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const emojiPickerRef = useRef(null);
  
  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up timer and recorder on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Click away to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Limit file size for demo (100MB)
    if (file.size > 100000000) {
      alert("Attachment too large. Please limit to 100MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPendingFile({
        name: file.name,
        type: file.type,
        data: event.target.result,
        displayText: `Sent a file: ${file.name}`
      });
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (event) => {
          setPendingFile({
            name: `voice-message-${Date.now()}.webm`,
            type: 'audio/webm',
            data: event.target.result,
            displayText: 'Sent a voice message'
          });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const onEmojiClick = (emojiObject) => {
    setInputText(prev => prev + emojiObject.emoji);
    // Optionally focus the textarea back
  };

  const handleConfirmSend = () => {
    if (pendingFile) {
      onSendMessage(pendingFile.displayText, false, {
        name: pendingFile.name,
        type: pendingFile.type,
        data: pendingFile.data
      });
      setPendingFile(null);
    }
  };

  const handleCancelSend = () => {
    setPendingFile(null);
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
          <button className="mobile-back-btn" onClick={onBackToList}>
            <ArrowLeft size={20} />
          </button>
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
          <button className="med-action-btn start-meet-btn" onClick={() => onStartCall('video')}>
            <Stethoscope size={18} />
            <span>Start Medical Session</span>
          </button>
          <div className="divider"></div>
          <button className="med-action-btn" onClick={() => onStartCall('audio')} title="Audio Call">
            <Phone size={20} />
          </button>
          <button className="med-action-btn" onClick={() => onStartCall('video')} title="Video Consult">
            <VideoIcon size={20} />
          </button>
          <button className="med-action-btn" title="Case Details">
            <Info size={20} />
          </button>
          <button className="med-action-btn">
            <MoreHorizontal size={20} />
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
                     ) : msg.fileType?.startsWith('video/') ? (
                        <video src={msg.fileData} controls className="img-attachment" />
                     ) : msg.fileType?.startsWith('audio/') ? (
                        <div className="audio-attachment">
                           <audio src={msg.fileData} controls className="audio-player" />
                        </div>
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
        {pendingFile && (
          <div className="file-verification-bar">
            <div className="verification-info">
               <FileText size={18} color="var(--med-primary)" />
               <div className="verification-text">
                  <span className="file-label">Confirm File Transfer</span>
                  <span className="file-name">{pendingFile.name} ({(pendingFile.data.length * 0.75 / 1024).toFixed(0)} KB)</span>
               </div>
            </div>
            <div className="verification-actions">
               <button className="verification-btn cancel" onClick={handleCancelSend}>
                  <CloseIcon size={16} /> Discard
               </button>
               <button className="verification-btn confirm" onClick={handleConfirmSend}>
                  <Check size={16} /> Send Securely
               </button>
            </div>
          </div>
        )}

        <div className="modern-input-wrapper">
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,audio/*"
          />
          
          <div className="input-left-actions">
            <button className="action-icon-btn" title="Attach File" onClick={() => fileInputRef.current.click()}>
              <Paperclip size={20} />
            </button>
            <div className="emoji-trigger-container" ref={emojiPickerRef}>
              <button className="action-icon-btn" title="Emojis" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                 <Smile size={20} />
              </button>
              {showEmojiPicker && (
                 <div className="emoji-picker-wrapper">
                   <EmojiPicker 
                      onEmojiClick={onEmojiClick}
                      autoFocusSearch={false}
                      theme="light"
                      width={320}
                      height={400}
                   />
                 </div>
              )}
            </div>
          </div>

          <div className="textarea-container">
            <textarea 
              placeholder={isRecording ? "Recording audio..." : `Send secure message to ${chat.name}...`} 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isRecording}
              rows={1}
            />
            {isRecording && (
              <div className="recording-overlay">
                <span className="recording-dot"></span>
                <span className="recording-timer">{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>

          <div className="input-right-actions">
            <button 
              className={`action-icon-btn ${isRecording ? 'recording-active' : ''}`}
              title={isRecording ? "Stop Recording" : "Record Voice Message"} 
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <Square size={20} color="#ef4444" /> : <Mic size={20} />}
            </button>
            
            <button className="action-icon-btn" title="More Options">
              <MoreHorizontal size={20} />
            </button>

            <button 
              className="modern-send-btn" 
              disabled={!inputText.trim() || isRecording} 
              onClick={handleSend}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
