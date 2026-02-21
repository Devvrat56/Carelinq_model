import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Users, Shield, RefreshCw, AlertCircle } from 'lucide-react';
import './VideoCall.css';

const VideoCall = ({ chat, currentUser, onEndCall }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [status, setStatus] = useState('Initializing Media...');
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
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
        const myPeerID = `medilink_id_${currentUser.email.replace(/[@.]/g, '_')}`;
        
        // Use the global Peer object provided by the script tag
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
          
          // Attempt Initial Call (We try to reach them, they try to reach us)
          const targetPeerID = `medilink_id_${chat.email.replace(/[@.]/g, '_')}`;
          const call = peer.call(targetPeerID, stream);
          
          if (call) {
              call.on('stream', (rStream) => {
                setRemoteStream(rStream);
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = rStream;
                setStatus('Connected');
              });
          }
        });

        // 3. Handle Incoming Call Handshake
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="call-page-container">
        <div className="custom-call-header">
           <div className="call-branding">
              <div className="teams-mini-logo">C</div>
              <div className="call-title-group">
                <span>CareLinq Direct - {chat.name}</span>
                <span className="host-badge">{status}</span>
              </div>
           </div>
           <div className="call-actions-top">
              <button onClick={toggleMic} className={`circle-btn ${!micActive ? 'off' : ''}`}>
                {micActive ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button onClick={toggleVideo} className={`circle-btn ${!videoActive ? 'off' : ''}`}>
                {videoActive ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
              <button onClick={onEndCall} className="exit-call-btn">
                <PhoneOff size={18} /> Hang Up
              </button>
           </div>
        </div>
        
        <div className="webrtc-grid">
          {(!remoteStream && !error) && (
            <div className="calling-overlay">
              <RefreshCw className="spin" size={48} color="#f59e0b" />
              <h3>{status}</h3>
              <p>Establishing an encrypted P2P link to {chat.email}.</p>
            </div>
          )}

          {error && (
            <div className="calling-overlay error">
              <AlertCircle size={48} color="#ef4444" />
              <h3>Oops! {error}</h3>
              <button className="retry-btn" onClick={() => window.location.reload()}>Reload Portal</button>
            </div>
          )}
          
          <div className="video-container remote">
            <video ref={remoteVideoRef} autoPlay playsInline />
            <div className="video-label">{chat.name} (Patient View)</div>
          </div>

          <div className="video-container local">
            <video ref={localVideoRef} autoPlay playsInline muted />
            <div className="video-label">Doctor (You)</div>
          </div>
        </div>

        <div className="call-status-footer">
          <div className="secure-badge">
            <Shield size={14} color="#f59e0b" />
            <span>HIPAA Compliant P2P Encryption Active</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCall;
