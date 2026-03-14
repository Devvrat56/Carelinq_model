import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import VideoCall from './components/VideoCall';
import Login from './components/Login';
import PatientDirectory from './components/PatientDirectory';
import TelehealthDashboard from './components/TelehealthDashboard';
import MedicalRecords from './components/MedicalRecords';
import ActivityDashboard from './components/ActivityDashboard';
import UserProfile from './components/UserProfile';
import PatientSummary from './components/PatientSummary';
import AIChatbot from './components/AIChatbot';
import { AnimatePresence, motion } from 'framer-motion';
import { Stethoscope, Phone, X, Check, Bell, Mail, RefreshCw, User, Thermometer, FileText, ShieldAlert, Activity, Sparkles } from 'lucide-react';
import Gun from 'gun';
import emailjs from '@emailjs/browser';
import { API_BASE_URL, WS_BASE_URL } from './config';
import './App.css';

// Gun.js Configuration

const gun = Gun({
  peers: [] // Using local storage only to prevent connection errors
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

  const [activeTab, setActiveTab] = useState('activity');
  const [showAIChat, setShowAIChat] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showChatWindowOnMobile, setShowChatWindowOnMobile] = useState(false);
  const [showStatus, setShowStatus] = useState(true);
  const [activeRoomID, setActiveRoomID] = useState(null);
  const socketRef = useRef(null);

  // Persistence
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('medichat_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('medichat_user');
    }
    localStorage.setItem('medichat_chats', JSON.stringify(chats));
  }, [currentUser, chats]);

  // Stable Cross-tab Sync Listener (DISABLED for independent testing)
  useEffect(() => {
    // We are disabling this so tab 1 can be Doctor and tab 2 can be Patient
    /*
    const channel = new BroadcastChannel('medichat_auth');
    channel.onmessage = (event) => {
      if (event.data.type === 'LOGIN_SYNC') {
        setCurrentUser(event.data.user);
      } else if (event.data.type === 'LOGOUT_SYNC') {
        setCurrentUser(null);
      }
    };
    return () => channel.close();
    */
  }, []);

  const handleLogin = (userData) => {
    const finalUser = { 
      ...userData,
      avatar: userData.avatar || `https://i.pravatar.cc/150?u=${userData.email.replace(/[@.]/g, '_')}` 
    };
    setCurrentUser(finalUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

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

  // --- WEB SOCKET SIGNALING ---
  useEffect(() => {
    if (!currentUser) return;

    const connectWS = () => {
      const socket = new WebSocket(WS_BASE_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("Connected to Signaling Server");
        socket.send(JSON.stringify({ type: 'identify', email: currentUser.email }));
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'incoming-call') {
          console.log("🏥 Incoming WebSocket Call:", data);
          setIncomingCall({
            fromEmail: data.fromEmail,
            fromName: data.fromName || data.fromEmail.split('@')[0],
            type: data.callType || 'video', // Standardize on 'type'
            roomID: data.roomID,
            timestamp: data.timestamp || Date.now()
          });
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
        }
      };

      socket.onclose = () => {
        console.log("Signaling Server Disconnected. Retrying...");
        setTimeout(connectWS, 3000);
      };
    };

    connectWS();
    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [currentUser]);

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

    // 2. FALLBACK SIGNALING (Gun.js): For reliability if WS is slow
    gun.get(`carelinq_signal_${mySafeEmail}`).on((data) => {
      if (data && data.fromEmail && (Date.now() - data.timestamp < 15000)) {
        if (!incomingCall && !isCalling) {
          console.log("🏥 Incoming Fallback (Gun) Signal Received:", data);
          setIncomingCall({
            fromEmail: data.fromEmail,
            fromName: data.fromName || data.fromEmail.split('@')[0],
            type: data.type || 'video',
            roomID: data.roomID,
            timestamp: data.timestamp
          });
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
        }
      }
    });
  }, [currentUser, incomingCall, isCalling]);

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

    // 1. SIGNAL the other user via WebSocket
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'initiate-call',
        targetEmail: activeChat.email,
        fromEmail: currentUser.email,
        fromName: currentUser.name,
        callType: type,
        roomID
      }));
    }

    // 1b. FALLBACK: Signal via Gun.js too
    gun.get(`carelinq_signal_${targetSafeEmail}`).put({ 
        fromEmail: currentUser.email, 
        fromName: currentUser.name, 
        type, 
        roomID, 
        timestamp: Date.now() 
    });

    setActiveRoomID(roomID);

    // 2. Post a direct invite in the chat
    onSendMessage(activeChat.id, `JOIN_CALL_REQUEST:${type.toUpperCase()}`, true);
    
    // 3. Optional: Background Notification
    console.log(`Call initiated to ${activeChat.email}. Signaling via P2P relay...`);

    // LOG CONSULT REQUEST TO MONGODB
    try {
      fetch(`${API_BASE_URL}/api/medical/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_email: currentUser.role === 'doctor' ? currentUser.email : activeChat.email,
          patient_email: currentUser.role === 'patient' ? currentUser.email : activeChat.email,
          consult_request_details: {
            type,
            initiated_by: currentUser.email,
            status: 'Requested'
          }
        })
      });
    } catch (err) {
      console.error("Consult log error:", err);
    }

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
    setActiveRoomID(incomingCall.roomID);
    setIsCalling(true);
    setIncomingCall(null);
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div className={`app-container carelinq-theme ${showChatWindowOnMobile ? 'chat-window-active' : ''}`}>
      {/* Unified Incoming Call Modal */}
      <AnimatePresence>
        {incomingCall && !isCalling && (
          <motion.div className="incoming-call-modal" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
             <div className="modal-inner">
                <div className="ringing-avatar">
                   <img src={`https://i.pravatar.cc/150?u=${incomingCall.fromEmail?.replace(/[@.]/g, '_')}`} alt="caller" />
                   <div className="pulse-ring"></div>
                </div>
                <h2>{incomingCall.fromName || 'Healthcare Provider'}</h2>
                <p>Incoming Secure {incomingCall.type || 'Consult'} Request</p>
                <div className="modal-actions">
                  <button className="btn-decline" onClick={() => setIncomingCall(null)}><X size={24} /></button>
                  <button className="btn-accept" onClick={handleAcceptCall}><Phone size={24} /></button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <span>{currentUser.role === 'doctor' ? 'Oncology & Dermatology Specialist' : 'Patient'}: <strong>{currentUser.email}</strong> <small>({APP_VERSION})</small></span>
              <button className="logout-btn" onClick={handleLogout}>Restart Session</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} role={currentUser.role} />
      <div className="main-content">
        {activeTab === 'consults' ? (
          <>
            <div className={`chat-list-wrapper ${showChatWindowOnMobile ? 'hide-mobile' : ''}`}>
              <ChatList 
                activeChat={activeChat?.id} 
                onSelectChat={handleSelectChat} 
                chats={chats}
                onAddCandidate={currentUser.role === 'doctor' ? (email) => {
                  const id = email.replace(/[@.]/g, '_');
                  if (chats.find(c => c.id === id)) return;
                  setChats([{ id, name: email.split('@')[0], email, avatar: `https://i.pravatar.cc/150?u=${id}`, lastMsg: 'Consultation Created' }, ...chats]);
                } : null}
              />
            </div>
            <div className={`chat-window-wrapper ${!showChatWindowOnMobile ? 'hide-mobile' : ''}`}>
              <ChatWindow 
                chat={activeChat} 
                messages={activeChat ? (messages[activeChat.id] || []) : []}
                onSendMessage={(t, s, f) => activeChat && onSendMessage(activeChat.id, t, s, f)}
                onStartCall={handleStartCall} 
                onBackToList={handleBackToList}
                role={currentUser.role}
              />
            </div>
          </>
        ) : (
          <div className={`placeholder-view tab-${activeTab}`}>
            <div className="placeholder-content">
              {activeTab === 'activity' && (
                <ActivityDashboard role={currentUser.role} user={currentUser} />
              )}
              {activeTab === 'patients' && (
                <PatientDirectory />
              )}
              {activeTab === 'summary' && (
                <PatientSummary user={currentUser} />
              )}
              {activeTab === 'records' && (
                <MedicalRecords user={currentUser} />
              )}
              {activeTab === 'telehealth' && (
                <TelehealthDashboard onStartCall={handleStartCall} role={currentUser.role} />
              )}
              {activeTab === 'settings' && (
                <UserProfile user={currentUser} onLogout={handleLogout} />
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
        {isCalling && (
          <VideoCall 
            chat={activeChat} 
            currentUser={currentUser} 
            sessionMessages={activeChat ? (messages[activeChat.id] || []) : []}
            onEndCall={() => setIsCalling(false)} 
            roomID={activeRoomID}
          />
        )}
      </AnimatePresence>
      {currentUser && currentUser.role === 'patient' && (
        <>
          <div className="ai-floating-toggle" onClick={() => setShowAIChat(true)}>
             <Sparkles size={28} />
          </div>
          <AnimatePresence>
            {showAIChat && (
              <AIChatbot 
                isOpen={showAIChat} 
                onClose={() => setShowAIChat(false)} 
                user={currentUser}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export default App;
