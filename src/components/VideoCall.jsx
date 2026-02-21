import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Users, Shield, RefreshCw } from 'lucide-react';
import Peer from 'simple-peer/simplepeer.min.js'; // Using minified version for compatibility
import Gun from 'gun';
import './VideoCall.css';

// Signaling relay (using the same Gun instance)
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun', 'https://relay.peer.ooo/gun']);

const VideoCall = ({ chat, currentUser, onEndCall }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [calling, setCalling] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef();
  
  // Unique Room ID for signaling (synchronized between peers)
  const participants = [currentUser.email, chat.email].sort();
  const signalRoomID = `carelinq_sig_v5_${participants[0].replace(/[@.]/g, '_')}_${participants[1].replace(/[@.]/g, '_')}`;

  useEffect(() => {
    // 1. Get User Media (Camera & Mic)
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // 2. Initialize Peer
        // We determine initiator based on alphabetical order of emails
        const isInitiator = currentUser.email < chat.email;
        
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

        // 3. Handle Signaling
        peer.on('signal', data => {
          // Send signal data to Gun signaling node
          const signalKey = isInitiator ? 'initiatorSignal' : 'responderSignal';
          gun.get(signalRoomID).get(signalKey).put(JSON.stringify(data));
        });

        // Listen for incoming signal from other peer
        const targetSignalKey = isInitiator ? 'responderSignal' : 'initiatorSignal';
        gun.get(signalRoomID).get(targetSignalKey).on(data => {
          if (data) {
            const parsedData = JSON.parse(data);
            peer.signal(parsedData);
          }
        });

        peer.on('stream', stream => {
          setRemoteStream(stream);
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
          setCalling(false);
        });

        peer.on('error', err => console.error('Peer error:', err));
        peer.on('close', () => onEndCall());

        peerRef.current = peer;
      })
      .catch(err => {
        console.error('Media Access Error:', err);
        alert("Please enable camera/microphone access to start the consultation.");
        onEndCall();
      });

    return () => {
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      if (peerRef.current) peerRef.current.destroy();
      // Clean up signaling node
      gun.get(signalRoomID).put(null);
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
              <div className="teams-mini-logo">M</div>
              <div className="call-title-group">
                <span>Direct P2P Consult - {chat.name}</span>
                <span className="host-badge">Secure WebRTC Tunnel</span>
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
          {calling && (
            <div className="calling-overlay">
              <RefreshCw className="spin" size={48} color="white" />
              <h3>Establishing P2P Connection...</h3>
              <p>Waiting for {chat.name} to join the secure tunnel.</p>
            </div>
          )}
          
          <div className="video-container remote">
            <video ref={remoteVideoRef} autoPlay playsInline />
            <div className="video-label">{chat.name} (Patient)</div>
            {!remoteStream && !calling && <div className="no-video">Connection Lost</div>}
          </div>

          <div className="video-container local">
            <video ref={localVideoRef} autoPlay playsInline muted />
            <div className="video-label">You (Lead Consultant)</div>
          </div>
        </div>

        <div className="call-status-footer">
          <div className="secure-badge">
            <Shield size={14} color="#10b981" />
            <span>P2P Encrypted: No external servers handling your health data.</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCall;
