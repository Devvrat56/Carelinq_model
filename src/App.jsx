import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import VideoCall from './components/VideoCall';
import Login from './components/Login';
import { AnimatePresence, motion } from 'framer-motion';
import { Stethoscope, Phone, X, Check, Bell, Mail } from 'lucide-react';
import Gun from 'gun';
import './App.css';

const gun = Gun({
  peers: [
    'https://gun-manhattan.herokuapp.com/gun',
    'https://relay.peer.ooo/gun',
    'https://gun-us.herokuapp.com/gun'
  ]
});

const INITIAL_CHATS = [
  { id: 'system_welcome', name: 'MediLink Support', lastMsg: 'Welcome to your secure clinic.', time: 'System', avatar: 'https://i.pravatar.cc/150?u=system', email: 'support@medilink.com' },
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

  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    if (currentUser) localStorage.setItem('medichat_user', JSON.stringify(currentUser));
    localStorage.setItem('medichat_chats', JSON.stringify(chats));
  }, [currentUser, chats]);

  // --- REAL-TIME DISCOVERY & SYNC ---
  useEffect(() => {
    if (!currentUser) return;
    const mySafeEmail = currentUser.email.replace(/[@.]/g, '_');

    // Listen for new people messaging me (Auto-Discovery)
    gun.get(`medilink_inbox_${mySafeEmail}`).map().on((data) => {
      if (data && data.fromEmail && data.fromEmail !== currentUser.email) {
        setChats(prev => {
          if (prev.find(c => c.email === data.fromEmail)) return prev;
          const newC = {
            id: data.fromEmail.replace(/[@.]/g, '_'),
            name: data.fromName || data.fromEmail.split('@')[0],
            email: data.fromEmail,
            lastMsg: 'New message received...',
            time: 'Now',
            avatar: `https://i.pravatar.cc/150?u=${data.fromEmail.replace(/[@.]/g, '_')}`
          };
          return [newC, ...prev];
        });
      }
    });

    // Listen for call signals
    gun.get(`medilink_signal_${mySafeEmail}`).on((data) => {
      if (data && data.fromEmail && (Date.now() - data.timestamp < 15000)) {
        setIncomingCall(data);
      }
    });
  }, [currentUser]);

  // Separate Effect to listen to specific rooms in the chat list
  useEffect(() => {
    if (!currentUser) return;
    
    chats.forEach(chat => {
      const participants = [currentUser.email, chat.email].sort();
      const roomID = `medilink_v3_${participants[0].replace(/[@.]/g, '_')}_${participants[1].replace(/[@.]/g, '_')}`;

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
            fileName: msg.fileName
          }].sort((a,b) => a.id - b.id) };
        });
      });
    });
  }, [currentUser, chats]);

  const onSendMessage = (chatId, text, isSystem = false, file = null) => {
    if (!activeChat || !currentUser) return;
    const participants = [currentUser.email, activeChat.email].sort();
    const roomID = `medilink_v3_${participants[0].replace(/[@.]/g, '_')}_${participants[1].replace(/[@.]/g, '_')}`;
    const targetSafeEmail = activeChat.email.replace(/[@.]/g, '_');

    const payload = { senderEmail: currentUser.email, text, timestamp: Date.now(), isSystem, fileData: file?.data, fileName: file?.name };
    gun.get(roomID).set(payload);

    // Alert the other user's inbox so the chat pops up for them
    gun.get(`medilink_inbox_${targetSafeEmail}`).set({ fromEmail: currentUser.email, fromName: currentUser.name, timestamp: Date.now() });
    
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, lastMsg: text, time: 'Now' } : c));
  };

  const handleStartCall = (type) => {
    if (!activeChat) return;
    const participants = [currentUser.email, activeChat.email].sort();
    const roomName = `${participants[0].replace(/[@.]/g, '_')}_${participants[1].replace(/[@.]/g, '_')}`;
    const targetSafeEmail = activeChat.email.replace(/[@.]/g, '_');

    // 1. Send Signal (for the popup)
    gun.get(`medilink_signal_${targetSafeEmail}`).put({ fromEmail: currentUser.email, fromName: currentUser.name, type, roomID: roomName, timestamp: Date.now() });

    // 2. Automated Message In Chat
    const meetingLink = `https://8x8.vc/${roomName}`;
    onSendMessage(activeChat.id, `🚑 Urgent: Consultation invitation. Join here: ${meetingLink}`, true);

    // 3. Option to send via REAL EMAIL (mailto)
    const emailSubject = `Medical Consultation Invitation - ${currentUser.name}`;
    const emailBody = `Hello, this is ${currentUser.name}. I am inviting you to a secure medical consultation. \n\nClick here to join: ${meetingLink}`;
    window.location.href = `mailto:${activeChat.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    setCallType(type);
    setIsCalling(true);
  };

  if (!currentUser) return <Login onLogin={(email) => setCurrentUser({ email, name: email.split('@')[0], id: email.replace(/[@.]/g, '_'), avatar: `https://i.pravatar.cc/150?u=${email.replace(/[@.]/g, '_')}` })} />;

  return (
    <div className="app-container medical-theme">
      <div className="user-status-bar med-status">
        <div className="status-item">
          <Stethoscope size={16} color="var(--med-primary)" />
          <span><strong>MediLink Protocol</strong>: {currentUser.email}</span>
          <button className="logout-link" onClick={() => setCurrentUser(null)}>Logout</button>
        </div>
      </div>

      <Sidebar />
      <div className="main-content">
        <ChatList 
          activeChat={activeChat?.id} 
          onSelectChat={setActiveChat} 
          chats={chats}
          onAddCandidate={(email) => {
            const id = email.replace(/[@.]/g, '_');
            if (chats.find(c => c.id === id)) return;
            setChats([{ id, name: email.split('@')[0], email, avatar: `https://i.pravatar.cc/150?u=${id}`, lastMsg: 'Consultation Initialized' }, ...chats]);
          }}
        />
        <ChatWindow 
          chat={activeChat} 
          messages={activeChat ? (messages[activeChat.id] || []) : []}
          onSendMessage={(t, s, f) => onSendMessage(activeChat.id, t, s, f)}
          onStartCall={handleStartCall} 
        />
      </div>

      <AnimatePresence>
        {incomingCall && !isCalling && (
          <motion.div className="call-notification" initial={{ y: -100 }} animate={{ y: 20 }} exit={{ y: -100 }}>
            <div className="notif-content">
              <div className="notif-icon"><Bell className="pulse-icon" /></div>
              <div className="notif-text">
                <strong>{incomingCall.fromName}</strong>
                <span>Calling for {incomingCall.type} Consult...</span>
              </div>
              <div className="notif-actions">
                <button className="accept-btn" onClick={() => {
                  const chatId = incomingCall.fromEmail.replace(/[@.]/g, '_');
                  const targetChat = chats.find(c => c.id === chatId) || { id: chatId, name: incomingCall.fromName, email: incomingCall.fromEmail, avatar: `https://i.pravatar.cc/150?u=${chatId}` };
                  if (!chats.find(c => c.id === chatId)) setChats([targetChat, ...chats]);
                  setActiveChat(targetChat);
                  setCallType(incomingCall.type);
                  setIsCalling(true);
                  setIncomingCall(null);
                }}><Check /></button>
                <button className="decline-btn" onClick={() => setIncomingCall(null)}><X /></button>
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
