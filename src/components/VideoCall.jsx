import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff, Users, Shield, 
  RefreshCw, AlertCircle, FileText, Clipboard, Pill, Activity as ActivityIcon,
  Maximize2, Layout, MoreVertical, Search, CheckCircle
} from 'lucide-react';
import Peer from 'simple-peer';
import './VideoCall.css';

const VideoCall = ({ chat, currentUser, onEndCall }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [status, setStatus] = useState('Initializing Media...');
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [activeClinicalTab, setActiveClinicalTab] = useState('notes');
  const [error, setError] = useState(null);
  const [showAudioBypass, setShowAudioBypass] = useState(false);
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const socketRef = useRef(null);
  const peerRef = useRef(null);

  const startMedia = (withVideo = true) => {
    // 1. Get Camera/Mic Access
    setStatus(withVideo ? 'Requesting Camera Access...' : 'Requesting Microphone Access...');
    setShowAudioBypass(false);
    
    const constraints = { 
      video: withVideo ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false, 
      audio: true 
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .catch(err => {
        if (withVideo) {
          console.warn('Full HD/Ideal constraints failed, trying basic video/audio...', err);
          return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        }
        throw err;
      })
      .catch(err => {
        if (withVideo) {
          console.warn('Video acquisition failed, falling back to AUDIO ONLY...', err);
          return navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        }
        throw err;
      })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const hasVideo = stream.getVideoTracks().length > 0;
        if (!hasVideo) {
          setStatus('Audio-Only Mode Enabled');
          setVideoActive(false);
        }

        // 2. Setup WebSocket Signaling
        setStatus(hasVideo ? 'Connecting Securely...' : 'Connecting Audio Tunnel...');
        const socket = new WebSocket('ws://localhost:8080');
        socketRef.current = socket;

        const roomId = [currentUser.email, chat.email].sort().join('--');

        socket.onopen = () => {
          setStatus('Joining Secured Room...');
          socket.send(JSON.stringify({ type: 'join', room: roomId }));
          
          const isInitiator = currentUser.email.toLowerCase() < chat.email.toLowerCase();
          
          const peer = new Peer({
            initiator: isInitiator,
            trickle: false,
            stream: stream,
            config: {
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
              ]
            }
          });

          peer.on('signal', (data) => {
            socket.send(JSON.stringify({
              type: 'signal',
              signal: data,
              from: currentUser.email
            }));
          });

          peer.on('stream', (rStream) => {
            setRemoteStream(rStream);
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = rStream;
            setStatus('Connected');
          });

          peer.on('error', (err) => {
            console.error('Peer Error:', err);
            setError('Connection failed. Retrying...');
          });

          peerRef.current = peer;
        };

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'signal' && peerRef.current) {
            peerRef.current.signal(data.signal);
          }
        };

        socket.onclose = () => {
          setStatus('Signaling Offline');
        };

        socket.onerror = () => {
          setError('Signaling server error. Make sure backend is running.');
        };
      })
      .catch(err => {
        console.error('Media Access Error:', err);
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No camera or microphone found. Please connect your hardware.');
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Camera access denied. Please enable permissions in your browser.');
        } else {
          setError(`Media Error: ${err.message}`);
        }
      });
  };

  useEffect(() => {
    startMedia(true);

    // Show bypass button if stuck for 6 seconds
    const timer = setTimeout(() => {
      setShowAudioBypass(true);
    }, 6000);

    return () => {
      clearTimeout(timer);
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      if (socketRef.current) socketRef.current.close();
      if (peerRef.current) peerRef.current.destroy();
    };
  }, []);

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micActive;
        setMicActive(!micActive);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoActive;
        setVideoActive(!videoActive);
      } else if (!videoActive) {
        // If we are currently in audio-only and trying to turn on video
        startMedia(true);
      }
    }
  };

  const handleScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (peerRef.current) {
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerRef.current._pc.getSenders().find(s => s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
          if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
          
          videoTrack.onended = () => {
            sender.replaceTrack(localStream.getVideoTracks()[0]);
            if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
          };
        }
      }
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleSaveSession = () => {
    alert("Oncology Consultation Session Saved. Records have been synchronized with the Patient Portal.");
    onEndCall();
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
              <button className="save-session-btn" onClick={handleSaveSession}>
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
                <button className="tool-btn" onClick={() => alert("Layout switched")}><Layout size={18} /></button>
                <button className="tool-btn" onClick={toggleFullScreen}><Maximize2 size={18} /></button>
                <button className="tool-btn text-danger" onClick={onEndCall}><PhoneOff size={18} /></button>
             </div>
          </div>
 
          <div className="video-grid-modern">
             {error ? (
               <div className="lobby-overlay error">
                  <AlertCircle size={32} color="#ef4444" />
                  <p>{error}</p>
                  <button onClick={() => window.location.reload()} className="retry-btn">Retry Connection</button>
               </div>
             ) : (!remoteStream) ? (
               <div className="lobby-overlay">
                  <RefreshCw className="spin" size={32} />
                  <p>{status}</p>
                  {showAudioBypass && (
                    <button 
                      className="bypass-btn" 
                      onClick={() => startMedia(false)}
                      style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', background: 'var(--med-primary)', color: 'white', border: 'none' }}
                    >
                      Skip Camera & Join with Audio Only
                    </button>
                  )}
               </div>
             ) : null}
             
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
                <button onClick={toggleMic} className={`control-btn ${!micActive ? 'off' : ''}`} title={micActive ? "Mute Mic" : "Unmute Mic"}>
                   {micActive ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
                <button onClick={toggleVideo} className={`control-btn ${!videoActive ? 'off' : ''}`} title={videoActive ? "Turn Video Off" : "Turn Video On"}>
                   {videoActive ? <VideoIcon size={20} /> : <VideoOff size={20} />}
                </button>
             </div>
             
             <div className="controls-group center">
                <button className="action-pill" onClick={() => alert("Specialist Invitation Link Copied to Clipboard")}>Invite Specialist</button>
                <button className="action-pill" onClick={handleScreenShare}>Share Screen</button>
             </div>
 
             <div className="controls-group">
                <button className="tool-btn" onClick={() => alert("More options coming soon")}><MoreVertical size={20} /></button>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCall;
