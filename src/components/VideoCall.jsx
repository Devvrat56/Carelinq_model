import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff, Users, Shield, 
  RefreshCw, AlertCircle, FileText, Clipboard, Pill, Activity as ActivityIcon,
  Maximize2, Layout, MoreVertical, Search, CheckCircle
} from 'lucide-react';
import './VideoCall.css';

const VideoCall = ({ chat, currentUser, onEndCall }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [status, setStatus] = useState('Initializing Media...');
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [activeClinicalTab, setActiveClinicalTab] = useState('notes');
  const [error, setError] = useState(null);
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerInstance = useRef(null);

  useEffect(() => {
    // 1. Get Camera/Mic Access
    setStatus('Requesting Camera Access...');
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // 2. Initialize PeerJS (Global Library from index.html)
        setStatus('Setting up Secure Tunnel...');
        const myPeerID = `carelinq_id_${currentUser.email.replace(/[@.]/g, '_')}`;
        
        const peer = new window.Peer(myPeerID, {
            debug: 1,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });

        peer.on('open', (id) => {
          setStatus('Ready. Waiting for Patient...');
          const targetPeerID = `carelinq_id_${chat.email.replace(/[@.]/g, '_')}`;
          const call = peer.call(targetPeerID, stream);
          
          if (call) {
              call.on('stream', (rStream) => {
                setRemoteStream(rStream);
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = rStream;
                setStatus('Connected');
              });
          }
        });

        peer.on('call', (call) => {
          setStatus('Connecting to Patient Stream...');
          call.answer(stream);
          call.on('stream', (rStream) => {
            setRemoteStream(rStream);
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = rStream;
            setStatus('Connected');
          });
        });

        peer.on('error', (err) => {
            console.warn('PeerJS Error:', err);
            if (err.type === 'peer-unavailable') {
                setStatus('Patient not online yet. Waiting...');
            } else {
                setError('Connection Interrupted. Please refresh.');
            }
        });

        peerInstance.current = peer;
      })
      .catch(err => {
        setError('Camera Access Denied. Please enable permissions.');
      });

    return () => {
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      if (peerInstance.current) peerInstance.current.destroy();
    };
  }, []);

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !micActive;
      setMicActive(!micActive);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !videoActive;
      setVideoActive(!videoActive);
    }
  };

  return (
    <motion.div 
      className="webrtc-call-overlay"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="doctor-meeting-room">
        {/* Left Clinical Sidebar */}
        <div className="clinical-sidebar">
           <div className="patient-mini-profile">
              <img src={chat.avatar} alt={chat.name} />
              <div className="info">
                 <h3>{chat.name}</h3>
                 <span>Patient ID: #CL-1042</span>
              </div>
           </div>
           
           <div className="clinical-tabs">
              <button 
                className={activeClinicalTab === 'notes' ? 'active' : ''} 
                onClick={() => setActiveClinicalTab('notes')}
              >
                <Clipboard size={18} /> Board Notes
              </button>
              <button 
                className={activeClinicalTab === 'rx' ? 'active' : ''} 
                onClick={() => setActiveClinicalTab('rx')}
              >
                <Pill size={18} /> Chemo/Rx
              </button>
              <button 
                className={activeClinicalTab === 'vitals' ? 'active' : ''} 
                onClick={() => setActiveClinicalTab('vitals')}
              >
                <ActivityIcon size={18} /> Lab/Vitals
              </button>
           </div>

           <div className="clinical-content">
              {activeClinicalTab === 'notes' && (
                <textarea placeholder="Type Tumor Board observations and staging notes..." className="clinical-textarea" />
              )}
              {activeClinicalTab === 'rx' && (
                <div className="rx-area">
                   <div className="search-rx">
                      <Search size={14} />
                      <input type="text" placeholder="Search Medicine..." />
                   </div>
                   <div className="rx-list">
                      <span>No prescriptions added yet.</span>
                   </div>
                   <button className="add-rx-btn">+ Add Medication</button>
                </div>
              )}
              {activeClinicalTab === 'vitals' && (
                <div className="vitals-panel">
                   <div className="vital-item"><span>BPM</span><strong>72</strong></div>
                   <div className="vital-item"><span>BP</span><strong>120/80</strong></div>
                   <div className="vital-item"><span>SpO2</span><strong>98%</strong></div>
                </div>
              )}
           </div>

           <div className="clinical-footer">
              <button className="save-session-btn">
                <CheckCircle size={16} /> Save & Finalize Consult
              </button>
           </div>
        </div>

        {/* Main Meet Area */}
        <div className="meet-main">
          <div className="meet-header">
             <div className="meet-branding">
                <div className="hipaa-badge">
                   <Shield size={14} fill="currentColor" /> ONCOLOGY SECURE
                </div>
                <h2>Oncology Meet: {chat.name}</h2>
                <span className="status-dot-text"><span className="dot"></span> {status}</span>
             </div>
             <div className="meet-actions-top">
                <button className="tool-btn"><Layout size={18} /></button>
                <button className="tool-btn"><Maximize2 size={18} /></button>
                <button className="tool-btn text-danger" onClick={onEndCall}><PhoneOff size={18} /></button>
             </div>
          </div>

          <div className="video-grid-modern">
             {(!remoteStream && !error) && (
               <div className="lobby-overlay">
                  <RefreshCw className="spin" size={32} />
                  <p>Encrypted Handshake in Progress...</p>
               </div>
             )}
             
             <div className="remote-view-container">
                <video ref={remoteVideoRef} autoPlay playsInline />
                <div className="label-overlay">{chat.name}</div>
             </div>

             <div className="local-view-mini">
                <video ref={localVideoRef} autoPlay playsInline muted />
                <div className="label-overlay">You (Doctor)</div>
             </div>
          </div>

          <div className="meet-controls-bar">
             <div className="controls-group">
                <button onClick={toggleMic} className={`control-btn ${!micActive ? 'off' : ''}`}>
                   {micActive ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
                <button onClick={toggleVideo} className={`control-btn ${!videoActive ? 'off' : ''}`}>
                   {videoActive ? <VideoIcon size={20} /> : <VideoOff size={20} />}
                </button>
             </div>
             
             <div className="controls-group center">
                <button className="action-pill">Invite Specialist</button>
                <button className="action-pill">Share Screen</button>
             </div>

             <div className="controls-group">
                <button className="tool-btn"><MoreVertical size={20} /></button>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCall;
