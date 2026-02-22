import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import VideoCall from './components/VideoCall';
import Login from './components/Login';
import { AnimatePresence, motion } from 'framer-motion';
import { Stethoscope, Phone, X, Check, Bell, Mail, RefreshCw } from 'lucide-react';
import Gun from 'gun';
import emailjs from '@emailjs/browser';
import './App.css';

// Gun.js Configuration

const gun = Gun({
  peers: [
    'https://gun-manhattan.herokuapp.com/gun',
    'https://relay.peer.ooo/gun',
    'https://gun-us.herokuapp.com/gun'
  ]
});

const APP_VERSION = "CareLinq-v1.1.0";

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
  const [showRefreshHint, setShowRefreshHint] = useState(true);

  // Persistence
  useEffect(() => {
    if (currentUser) localStorage.setItem('medichat_user', JSON.stringify(currentUser));
    localStorage.setItem('medichat_chats', JSON.stringify(chats));
  }, [currentUser, chats]);

  // --- HARD REFRESH HINT ---
  useEffect(() => {
    const timer = setTimeout(() => setShowRefreshHint(false), 8000);
    return () => clearTimeout(timer);
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
    setCallType(incomingCall.type);
    setIsCalling(true);
    setIncomingCall(null);
  };

  if (!currentUser) return <Login onLogin={(email) => setCurrentUser({ email, name: email.split('@')[0], id: email.replace(/[@.]/g, '_'), avatar: `https://i.pravatar.cc/150?u=${email.replace(/[@.]/g, '_')}` })} />;

  return (
    <div className="app-container carelinq-theme">
      {showRefreshHint && (
        <div className="version-banner">
          <RefreshCw size={14} className="spin" />
          <span>New Version Active! Please <strong>Hard Refresh (Ctrl+F5)</strong> to sync the video engine.</span>
        </div>
      )}

      <div className="user-status-bar med-status">
        <div className="status-item">
          <Stethoscope size={16} color="var(--med-primary)" />
          <span>CareLinq Doctor: <strong>{currentUser.email}</strong> <small>({APP_VERSION})</small></span>
          <button className="logout-btn" onClick={() => setCurrentUser(null)}>Restart Session</button>
        </div>
      </div>

      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="main-content">
        {activeTab === 'consults' ? (
          <>
            <ChatList 
              activeChat={activeChat?.id} 
              onSelectChat={setActiveChat} 
              chats={chats}
              onAddCandidate={(email) => {
                const id = email.replace(/[@.]/g, '_');
                if (chats.find(c => c.id === id)) return;
                setChats([{ id, name: email.split('@')[0], email, avatar: `https://i.pravatar.cc/150?u=${id}`, lastMsg: 'Consultation Created' }, ...chats]);
              }}
            />
            <ChatWindow 
              chat={activeChat} 
              messages={activeChat ? (messages[activeChat.id] || []) : []}
              onSendMessage={(t, s, f) => onSendMessage(activeChat.id, t, s, f)}
              onStartCall={handleStartCall} 
            />
          </>
        ) : (
          <div className="placeholder-view">
            <div className="placeholder-content">
              {activeTab === 'activity' && (
                <>
                  <h2>Recent Activity</h2>
                  <p>Track your latest medical sessions and patient interactions here.</p>
                  <div className="activity-list">
                    <div className="activity-item">System update completed: {APP_VERSION}</div>
                    <div className="activity-item">New patient record shared by CareLinq Support</div>
                  </div>
                </>
              )}
              {activeTab === 'patients' && (
                <>
                  <h2>Patient Directory</h2>
                  <p>Manage and search through your patient list.</p>
                  <div className="search-bar-placeholder">Search Patients...</div>
                </>
              )}
              {activeTab === 'records' && (
                <>
                  <h2>Medical Records</h2>
                  <p>Access secure patient history and clinical notes.</p>
                </>
              )}
              {activeTab === 'telehealth' && (
                <>
                  <h2>Telehealth Dashboard</h2>
                  <p>Schedule and manage your upcoming video consultations.</p>
                  <button className="start-session-btn" onClick={() => setActiveTab('consults')}>Start New Session</button>
                </>
              )}
              {activeTab === 'settings' && (
                <>
                  <h2>Account Settings</h2>
                  <p>Manage your profile, notifications, and security preferences.</p>
                  <div className="settings-options">
                    <div className="setting-row">Profile Information</div>
                    <div className="setting-row">Privacy & Security</div>
                    <div className="setting-row">CareLinq Subscription</div>
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
