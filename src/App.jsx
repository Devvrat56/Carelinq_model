import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import VideoCall from './components/VideoCall';
import Login from './components/Login';
import PatientDirectory from './components/PatientDirectory';
import TelehealthDashboard from './components/TelehealthDashboard';
import MedicalRecords from './components/MedicalRecords';
import { AnimatePresence, motion } from 'framer-motion';
import { Stethoscope, Phone, X, Check, Bell, Mail, RefreshCw, User, Thermometer, FileText, ShieldAlert, Activity } from 'lucide-react';
import Gun from 'gun';
import emailjs from '@emailjs/browser';
import './App.css';

// Gun.js Configuration

const gun = Gun({
  peers: [
    'https://gun-manhattan.herokuapp.com/gun',
    'https://gun-us.herokuapp.com/gun',
    'https://gun-eu.herokuapp.com/gun',
    'https://peer.wall.org/gun',
    'https://gunjs.herokuapp.com/gun'
  ]
});

const APP_VERSION = "OncoPortal v2.4.1";

const INITIAL_CHATS = [
  { id: 'carelinq_support', name: 'CareLinq Support', lastMsg: 'Your real-time clinic is active.', time: 'System', avatar: 'https://i.pravatar.cc/150?u=carelinq', email: 'support@carelinq.com' },
];

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('medichat_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('medichat_chats');
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  const [activeTab, setActiveTab] = useState('consults');
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showChatWindowOnMobile, setShowChatWindowOnMobile] = useState(false);
  const [showStatus, setShowStatus] = useState(true);

  // Persistence
  useEffect(() => {
    if (currentUser) localStorage.setItem('medichat_user', JSON.stringify(currentUser));
    localStorage.setItem('medichat_chats', JSON.stringify(chats));
  }, [currentUser, chats]);

  // Handle active chat selection and toggle view on mobile
  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    setShowChatWindowOnMobile(true);
  };

  const handleBackToList = () => {
    setShowChatWindowOnMobile(false);
  };

  // --- POPUP TIMERS ---
  useEffect(() => {
    const statusTimer = setTimeout(() => setShowStatus(false), 4000);
    return () => clearTimeout(statusTimer);
  }, []);

  // --- REAL-TIME DISCOVERY & SYNC ---
  useEffect(() => {
    if (!currentUser) return;
    const mySafeEmail = currentUser.email.replace(/[@.]/g, '_');

    // 1. DISCOVERY: Listen for incoming conversation requests
    gun.get(`carelinq_inbox_${mySafeEmail}`).map().on((data) => {
      if (data && data.fromEmail && data.fromEmail !== currentUser.email) {
        setChats(prev => {
          if (prev.find(c => c.email === data.fromEmail)) return prev;
          const newDoc = {
            id: data.fromEmail.replace(/[@.]/g, '_'),
            name: data.fromName || data.fromEmail.split('@')[0],
            email: data.fromEmail,
            lastMsg: 'Started medical session...',
            time: 'Now',
            avatar: `https://i.pravatar.cc/150?u=${data.fromEmail.replace(/[@.]/g, '_')}`
          };
          return [newDoc, ...prev];
        });
      }
    });

    // 2. SIGNALING: Listen for Call Signals (Video/Audio)
    gun.get(`carelinq_signal_${mySafeEmail}`).on((data) => {
      if (data && data.fromEmail && (Date.now() - data.timestamp < 20000)) {
        // PLAY RINGING SOUND (Simulated with a visual pulse)
        setIncomingCall(data);
      }
    });
  }, [currentUser]);

  // 3. MESSAGING: Listen for real-time messages in active chats
  useEffect(() => {
    if (!currentUser) return;
    
    chats.forEach(chat => {
      const participants = [currentUser.email, chat.email].sort();
      const roomID = `carelinq_v4_${participants[0].replace(/[@.]/g, '_')}_${participants[1].replace(/[@.]/g, '_')}`;

      gun.get(roomID).map().on((msg, id) => {
        if (!msg || !msg.timestamp) return;
        setMessages(prev => {
          const roomMsgs = prev[chat.id] || [];
          if (roomMsgs.find(m => m.gunId === id)) return prev;
          return { ...prev, [chat.id]: [...roomMsgs, {
            id: msg.timestamp,
            gunId: id,
            sender: msg.senderEmail === currentUser.email ? 'me' : 'them',
            text: msg.text,
            time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: msg.isSystem,
            fileData: msg.fileData,
            fileName: msg.fileName,
            fileType: msg.fileType
          }].sort((a,b) => a.id - b.id) };
        });
      });
    });
  }, [currentUser, chats]);

  const onSendMessage = (chatId, text, isSystem = false, file = null) => {
    if (!activeChat || !currentUser) return;
    const participants = [currentUser.email, activeChat.email].sort();
    const roomID = `carelinq_v4_${participants[0].replace(/[@.]/g, '_')}_${participants[1].replace(/[@.]/g, '_')}`;
    const targetSafeEmail = activeChat.email.replace(/[@.]/g, '_');

    const payload = { senderEmail: currentUser.email, text, timestamp: Date.now(), isSystem, fileData: file?.data, fileName: file?.name, fileType: file?.type };
    
    // Save to the conversation
    gun.get(roomID).set(payload);

    // Ping the recipient's inbox
    gun.get(`carelinq_inbox_${targetSafeEmail}`).set({ 
        fromEmail: currentUser.email, 
        fromName: currentUser.name, 
        timestamp: Date.now() 
    });
    
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, lastMsg: text, time: 'Now' } : c));
  };

  const handleStartCall = (type) => {
    if (!activeChat) return;

    const participants = [currentUser.email, activeChat.email].sort();
    const roomID = `carelinq_sig_v5_${participants[0].replace(/[@.]/g, '_')}_${participants[1].replace(/[@.]/g, '_')}`;
    const targetSafeEmail = activeChat.email.replace(/[@.]/g, '_');

    // 1. SIGNAL the other user (This triggers the incoming call popup)
    gun.get(`carelinq_signal_${targetSafeEmail}`).put({ 
        fromEmail: currentUser.email, 
        fromName: currentUser.name, 
        type, 
        roomID, 
        timestamp: Date.now() 
    });

    // 2. Post a direct invite in the chat
    const portalLink = window.location.origin;
    onSendMessage(activeChat.id, `🚑 Secure P2P ${type} session started. Please open the CareLinq Portal to join.`, true);
    
    // 3. Email fallback (Optional but good for notifications)
    const subject = `Urgent: Secure P2P Consult - ${currentUser.name}`;
    const body = `Hello, ${currentUser.name} has started a secure P2P medical consultation. Please log into your CareLinq Portal at ${portalLink} to connect safely.`;
    window.open(`mailto:${activeChat.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);

    setCallType(type);
    setIsCalling(true);
  };

  const handleAcceptCall = () => {
    if (!incomingCall) return;
    const chatId = incomingCall.fromEmail.replace(/[@.]/g, '_');
    const targetChat = chats.find(c => c.id === chatId) || { 
        id: chatId, 
        name: incomingCall.fromName, 
        email: incomingCall.fromEmail, 
        avatar: `https://i.pravatar.cc/150?u=${chatId}` 
    };
    if (!chats.find(c => c.id === chatId)) setChats([targetChat, ...chats]);
    setActiveChat(targetChat);
    setShowChatWindowOnMobile(true);
    setCallType(incomingCall.type);
    setIsCalling(true);
    setIncomingCall(null);
  };

  if (!currentUser) return <Login onLogin={(email) => setCurrentUser({ email, name: email.split('@')[0], id: email.replace(/[@.]/g, '_'), avatar: `https://i.pravatar.cc/150?u=${email.replace(/[@.]/g, '_')}` })} />;

  return (
    <div className={`app-container carelinq-theme ${showChatWindowOnMobile ? 'chat-window-active' : ''}`}>

      <AnimatePresence>
        {showStatus && (
          <motion.div 
            className="user-status-bar med-status"
            initial={{ y: -100, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: -100, x: '-50%', opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          >
            <div className="status-item">
              <Stethoscope size={16} color="var(--med-primary)" />
              <span>Oncology Specialist: <strong>{currentUser.email}</strong> <small>({APP_VERSION})</small></span>
              <button className="logout-btn" onClick={() => setCurrentUser(null)}>Restart Session</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="main-content">
        {activeTab === 'consults' ? (
          <>
            <div className={`chat-list-wrapper ${showChatWindowOnMobile ? 'hide-mobile' : ''}`}>
              <ChatList 
                activeChat={activeChat?.id} 
                onSelectChat={handleSelectChat} 
                chats={chats}
                onAddCandidate={(email) => {
                  const id = email.replace(/[@.]/g, '_');
                  if (chats.find(c => c.id === id)) return;
                  setChats([{ id, name: email.split('@')[0], email, avatar: `https://i.pravatar.cc/150?u=${id}`, lastMsg: 'Consultation Created' }, ...chats]);
                }}
              />
            </div>
            <div className={`chat-window-wrapper ${!showChatWindowOnMobile ? 'hide-mobile' : ''}`}>
              <ChatWindow 
                chat={activeChat} 
                messages={activeChat ? (messages[activeChat.id] || []) : []}
                onSendMessage={(t, s, f) => activeChat && onSendMessage(activeChat.id, t, s, f)}
                onStartCall={handleStartCall} 
                onBackToList={handleBackToList}
              />
            </div>
          </>
        ) : (
          <div className="placeholder-view">
            <div className="placeholder-content" style={{ maxWidth: '900px' }}>
              {activeTab === 'activity' && (
                <>
                  <h2>Patient Activity & Details</h2>
                  <p>Comprehensive overview of current patient status and medical history.</p>
                  
                  <div className="patient-details-grid">
                    {/* Basic Info Card */}
                    <div className="details-card">
                      <h3><User size={18} /> Basic Information</h3>
                      <div className="patient-info-row">
                        <span className="label">Full Name</span>
                        <span className="value">John Doe</span>
                      </div>
                      <div className="patient-info-row">
                        <span className="label">Age / Gender</span>
                        <span className="value">42 / Male</span>
                      </div>
                      <div className="patient-info-row">
                        <span className="label">Blood Group</span>
                        <span className="value">O Positive</span>
                      </div>
                      <div className="patient-info-row">
                        <span className="label">Patient ID</span>
                        <span className="value">#CL-99234</span>
                      </div>
                    </div>

                    {/* Vitals Card */}
                    <div className="details-card">
                      <h3><Thermometer size={18} /> Live Vitals</h3>
                      <div className="patient-info-row">
                        <span className="label">Heart Rate</span>
                        <span className="value">72 BPM <span className="vitals-badge">Normal</span></span>
                      </div>
                      <div className="patient-info-row">
                        <span className="label">Blood Pressure</span>
                        <span className="value">120/80 <span className="vitals-badge">Normal</span></span>
                      </div>
                      <div className="patient-info-row">
                        <span className="label">SpO2</span>
                        <span className="value">98% <span className="vitals-badge">Optimal</span></span>
                      </div>
                      <div className="patient-info-row">
                        <span className="label">Temperature</span>
                        <span className="value">98.6°F <span className="vitals-badge">Normal</span></span>
                      </div>
                    </div>

                    {/* Recent Diagnosis Card */}
                    <div className="details-card">
                      <h3><FileText size={18} /> Recent Diagnosis</h3>
                      <div className="patient-info-row">
                        <span className="label">Condition</span>
                        <span className="value">Type 2 Diabetes</span>
                      </div>
                      <div className="patient-info-row">
                        <span className="label">Last Visit</span>
                        <span className="value">Oct 15, 2025</span>
                      </div>
                      <div className="patient-info-row">
                        <span className="label">Medication</span>
                        <span className="value">Metformin 500mg</span>
                      </div>
                    </div>

                    {/* Alerts Card */}
                    <div className="details-card">
                      <h3><ShieldAlert size={18} /> Critical Alerts</h3>
                      <div className="patient-info-row">
                        <span className="label">Allergies</span>
                        <span className="value" style={{ color: '#ef4444' }}>Penicillin, Peanuts</span>
                      </div>
                      <div className="patient-info-row">
                        <span className="label">Risk Level</span>
                        <span className="value"><span className="vitals-badge warning">Moderate</span></span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'patients' && (
                <PatientDirectory />
              )}
              {activeTab === 'records' && (
                <MedicalRecords />
              )}
              {activeTab === 'telehealth' && (
                <TelehealthDashboard onStartCall={handleStartCall} />
              )}
              {activeTab === 'settings' && (
                <>
                  <h2>Oncology Patient Registry</h2>
                  <p>Comprehensive cancer care management and longitudinal history.</p>
                  <div className="search-bar-placeholder">Search Oncology Patients...</div>
                  <div className="settings-options">
                    <div className="setting-row">Profile Information</div>
                    <div className="setting-row">Privacy & Security</div>
                    <div className="setting-row">OncoLink Subscription</div>
                  </div>
                </>
              )}
              {activeTab === 'more' && (
                <>
                  <h2>More Resources</h2>
                  <p>Access additional tools and support services.</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {incomingCall && !isCalling && (
          <motion.div className="incoming-call-modal" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
             <div className="modal-inner">
                <div className="ringing-avatar">
                   <img src={`https://i.pravatar.cc/150?u=${incomingCall.fromEmail.replace(/[@.]/g, '_')}`} alt="caller" />
                   <div className="pulse-ring"></div>
                </div>
                <h2>{incomingCall.fromName}</h2>
                <p>Incoming Secure {incomingCall.type} Consult</p>
                <div className="modal-actions">
                  <button className="btn-decline" onClick={() => setIncomingCall(null)}><X size={24} /></button>
                  <button className="btn-accept" onClick={handleAcceptCall}><Phone size={24} /></button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCalling && <VideoCall chat={activeChat} currentUser={currentUser} onEndCall={() => setIsCalling(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default App;
