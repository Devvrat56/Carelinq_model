import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import VideoCall from './components/VideoCall';
import Login from './components/Login';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe, Phone, X, Check, Stethoscope, FileText } from 'lucide-react';
import Gun from 'gun';
import './App.css';

// Initialize Gun with public relay peers
// Using specialized relay nodes to ensure cross-network connectivity
const gun = Gun({
  peers: [
    'https://gun-manhattan.herokuapp.com/gun',
    'https://relay.peer.ooo/gun'
  ]
});

const INITIAL_CHATS = [
  { id: 'echo_service', name: 'Support / Echo', lastMsg: 'Test your connection here', time: 'System', avatar: 'https://i.pravatar.cc/150?u=system', email: 'echo@medilink.com' },
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

  // Sync state with localStorage
  useEffect(() => {
    if (currentUser) localStorage.setItem('medichat_user', JSON.stringify(currentUser));
    localStorage.setItem('medichat_chats', JSON.stringify(chats));
  }, [currentUser, chats]);

  // REAL-TIME ENGINE: Listen for everything (Messages & Call Signals)
  useEffect(() => {
    if (!currentUser) return;

    // Listen for call signals specifically FOR ME
    const mySignalID = `medilink_signal_${currentUser.email.replace(/[@.]/g, '_')}`;
    gun.get(mySignalID).on((data) => {
      if (data && data.fromEmail && data.type && (Date.now() - data.timestamp < 10000)) {
        // If the signal is fresh (less than 10s old), show the popup
        setIncomingCall({
          name: data.fromName || data.fromEmail.split('@')[0],
          email: data.fromEmail,
          type: data.type,
          roomID: data.roomID
        });
      }
    });

    // Listen for messages for EACH chat in our list
    chats.forEach(chat => {
      const participants = [currentUser.email, chat.email].sort();
      const roomID = `medilink_room_${participants[0].replace(/[@.]/g, '_')}_${participants[1].replace(/[@.]/g, '_')}`;

      gun.get(roomID).map().on((data, id) => {
        if (data && (data.text || data.fileData)) {
          setMessages(prev => {
            const roomMsgs = prev[chat.id] || [];
            if (roomMsgs.find(m => m.gunId === id)) return prev;
            
            const newMsg = {
              id: data.timestamp,
              gunId: id,
              sender: data.senderEmail === currentUser.email ? 'me' : 'them',
              text: data.text,
              fileData: data.fileData,
              fileName: data.fileName,
              fileType: data.fileType,
              time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSystem: data.isSystem
            };
            
            const updated = [...roomMsgs, newMsg].sort((a, b) => a.id - b.id);
            return { ...prev, [chat.id]: updated };
          });
        }
      });
    });
  }, [currentUser, chats.length]);

  const handleLogin = (email) => {
    const user = { 
      email: email, 
      id: email.replace(/[@.]/g, '_'),
      name: email.split('@')[0],
      avatar: `https://i.pravatar.cc/150?u=${email.replace(/[@.]/g, '_')}`
    };
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('medichat_user');
  };

  const onAddCandidate = (email) => {
    const id = email.replace(/[@.]/g, '_');
    if (chats.find(c => c.id === id)) return;
    
    const newChat = {
      id: id,
      name: email.split('@')[0],
      lastMsg: 'New Patient Connection',
      time: 'New',
      avatar: `https://i.pravatar.cc/150?u=${id}`,
      email: email
    };
    setChats([newChat, ...chats]);
    setActiveChat(newChat);
  };

  const onSendMessage = (chatId, text, isSystem = false, fileObj = null) => {
    if (!activeChat) return;

    const participants = [currentUser.email, activeChat.email].sort();
    const roomID = `medilink_room_${participants[0].replace(/[@.]/g, '_')}_${participants[1].replace(/[@.]/g, '_')}`;

    const msgData = {
      senderEmail: currentUser.email,
      text: text,
      timestamp: Date.now(),
      isSystem: isSystem,
      fileData: fileObj?.data, // Base64 string
      fileName: fileObj?.name,
      fileType: fileObj?.type
    };

    gun.get(roomID).set(msgData);

    setChats(prev => prev.map(c => 
      c.id === chatId ? { ...c, lastMsg: fileObj ? `📄 ${fileObj.name}` : text, time: 'Now' } : c
    ));
  };

  const handleStartCall = (type) => {
    if (!activeChat) return;

    // Generate synchronous room name
    const participants = [currentUser.id, activeChat.id].sort();
    const roomName = `MediLink_Room_${participants[0]}_${participants[1]}`;

    // 1. SIGNAL the other user (Triggers the Popup)
    const targetSignalID = `medilink_signal_${activeChat.email.replace(/[@.]/g, '_')}`;
    gun.get(targetSignalID).put({
      fromEmail: currentUser.email,
      fromName: currentUser.name,
      type: type,
      roomID: roomName,
      timestamp: Date.now()
    });

    // 2. Post record to chat (Triggers a clickable message)
    const meetingMessage = `🚑 ${type === 'video' ? 'Video' : 'Audio'} session started. Join here: https://meet.ffmuc.net/${roomName}`;
    onSendMessage(activeChat.id, meetingMessage, true);
    
    setCallType(type);
    setIsCalling(true);
  };

  const handleAcceptCall = () => {
    if (!incomingCall) return;
    // Set active chat to the caller so the room IDs match
    const matchingChat = chats.find(c => c.email === incomingCall.email) || {
        id: incomingCall.email.replace(/[@.]/g, '_'),
        name: incomingCall.name,
        email: incomingCall.email,
        avatar: `https://i.pravatar.cc/150?u=${incomingCall.email.replace(/[@.]/g, '_')}`
    };
    setActiveChat(matchingChat);
    setCallType(incomingCall.type);
    setIsCalling(true);
    setIncomingCall(null);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container medical-theme">
      <div className="user-status-bar med-status">
        <div className="status-item">
          <Stethoscope size={16} color="var(--med-primary)" />
          <span><strong>Doctor Identity</strong>: {currentUser.email}</span>
          <button className="logout-link" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <Sidebar />
      <div className="main-content">
        <ChatList 
          activeChat={activeChat?.id} 
          onSelectChat={setActiveChat} 
          chats={chats}
          onAddCandidate={onAddCandidate}
        />
        <ChatWindow 
          chat={activeChat} 
          messages={activeChat ? (messages[activeChat.id] || []) : []}
          onSendMessage={(text, isSystem, file) => onSendMessage(activeChat.id, text, isSystem, file)}
          onStartCall={handleStartCall} 
        />
      </div>

      {/* Real-time Incoming Call Notification */}
      <AnimatePresence>
        {incomingCall && !isCalling && (
          <motion.div 
            className="call-notification"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
          >
            <div className="notif-content">
              <div className="notif-icon"><Phone className="pulse-icon" /></div>
              <div className="notif-text">
                <strong>{incomingCall.name}</strong>
                <span>Incoming Medical {incomingCall.type} Consult...</span>
              </div>
              <div className="notif-actions">
                <button className="accept-btn" onClick={handleAcceptCall}><Check size={20} /></button>
                <button className="decline-btn" onClick={() => setIncomingCall(null)}><X size={20} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCalling && (
          <VideoCall 
            chat={activeChat} 
            currentUser={currentUser}
            onEndCall={() => setIsCalling(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
