import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import VideoCall from './components/VideoCall';
import Login from './components/Login';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe, Phone, X, Check, Stethoscope } from 'lucide-react';
import Gun from 'gun';
import './App.css';

// Initialize Gun with public relay peers for real-time sync across computers
const gun = Gun({
  peers: [
    'https://gun-manhattan.herokuapp.com/gun',
    'https://gun-relay.us-east-1.linodeobjects.com/gun'
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

  // Sync Chats with LocalStorage
  useEffect(() => {
    if (currentUser) localStorage.setItem('medichat_user', JSON.stringify(currentUser));
    localStorage.setItem('medichat_chats', JSON.stringify(chats));
  }, [currentUser, chats]);

  // REAL-TIME SYNC: Listen for messages in Gun
  useEffect(() => {
    if (!currentUser) return;

    // Listen for messages for EACH chat in our list
    chats.forEach(chat => {
      // Shared Room ID is a combination of both emails (sorted)
      const participants = [currentUser.email, chat.email].sort();
      const roomID = `medilink_room_${participants[0].replace(/[@.]/g, '_')}_${participants[1].replace(/[@.]/g, '_')}`;

      gun.get(roomID).map().on((data, id) => {
        if (data && data.text) {
          setMessages(prev => {
            const roomMsgs = prev[chat.id] || [];
            // Check if message already exists (by Gun ID)
            if (roomMsgs.find(m => m.gunId === id)) return prev;
            
            const newMsg = {
              id: data.timestamp,
              gunId: id,
              sender: data.senderEmail === currentUser.email ? 'me' : 'them',
              text: data.text,
              time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSystem: data.isSystem
            };
            
            return {
              ...prev,
              [chat.id]: [...roomMsgs, newMsg].sort((a, b) => a.id - b.id)
            };
          });
        }
      });
    });

    return () => {
      // In a more complex app, we'd unsubscribe here
    };
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
      lastMsg: 'Initiated medical consultation',
      time: 'New',
      avatar: `https://i.pravatar.cc/150?u=${id}`,
      email: email
    };
    setChats([newChat, ...chats]);
    setActiveChat(newChat);
  };

  const onSendMessage = (chatId, text, isSystem = false) => {
    if (!activeChat) return;

    const participants = [currentUser.email, activeChat.email].sort();
    const roomID = `medilink_room_${participants[0].replace(/[@.]/g, '_')}_${participants[1].replace(/[@.]/g, '_')}`;

    const msgData = {
      senderEmail: currentUser.email,
      text: text,
      timestamp: Date.now(),
      isSystem: isSystem
    };

    // Save to Gun (Real-time Peer-to-Peer sync)
    gun.get(roomID).set(msgData);

    // Update last message preview locally
    setChats(prev => prev.map(c => 
      c.id === chatId ? { ...c, lastMsg: text, time: 'Now' } : c
    ));
  };

  const handleStartCall = (type) => {
    if (!activeChat) return;
    const meetingMessage = `🚨 Telehealth ${type} session started.`;
    onSendMessage(activeChat.id, meetingMessage, true);
    setCallType(type);
    setIsCalling(true);
  };

  const handleEndCall = () => {
    setIsCalling(false);
    setCallType(null);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container medical-theme">
      <div className="user-status-bar med-status">
        <div className="status-item">
          <Stethoscope size={16} color="var(--med-primary)" />
          <span><strong>Medical Hub</strong>: {currentUser.email}</span>
          <button className="logout-link" onClick={handleLogout}>Switch User</button>
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
          onSendMessage={(text) => onSendMessage(activeChat.id, text)}
          onStartCall={handleStartCall} 
        />
      </div>

      <AnimatePresence>
        {isCalling && (
          <VideoCall 
            chat={activeChat} 
            currentUser={currentUser}
            onEndCall={handleEndCall}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
