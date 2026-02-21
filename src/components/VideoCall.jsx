import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Users, Shield, RefreshCw } from 'lucide-react';
import { Peer } from 'peerjs';
import './VideoCall.css';

const VideoCall = ({ chat, currentUser, onEndCall }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [calling, setCalling] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerInstance = useRef(null);

  useEffect(() => {
    // 1. Get User Media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // 2. Initialize PeerJS (Our 'Backend' Signaling Service)
        const myPeerID = `medilink_${currentUser.email.replace(/[@.]/g, '_')}`;
        const peer = new Peer(myPeerID, {
            debug: 2
        });

        peer.on('open', (id) => {
          console.log('My Peer ID is: ' + id);
          
          // If we are joining, we call the other person
          // Wait a bit to ensure the other person is also online
          setTimeout(() => {
            const targetPeerID = `medilink_${chat.email.replace(/[@.]/g, '_')}`;
            const call = peer.call(targetPeerID, stream);
            
            call.on('stream', (remoteStream) => {
              setRemoteStream(remoteStream);
              if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
              setCalling(false);
            });
          }, 2000);
        });

        // 3. Handle Incoming Calls
        peer.on('call', (call) => {
          call.answer(stream); // Answer the call with our own stream
          call.on('stream', (remoteStream) => {
            setRemoteStream(remoteStream);
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
            setCalling(false);
          });
        });

        peer.on('error', (err) => {
            console.error('PeerJS Error:', err);
            // If the other peer isn't online yet, it's fine, we keep waiting
        });

        peerInstance.current = peer;
      })
      .catch(err => {
        console.error('Media Access Error:', err);
        alert("Camera/Mic access is required for audio/video consultations.");
        onEndCall();
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
                <span>Secure Tunnel - {chat.name}</span>
                <span className="host-badge">Professional P2P Audio/Video</span>
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
              <RefreshCw className="spin" size={48} color="#f59e0b" />
              <h3>Connecting Securely...</h3>
              <p>Establishing an encrypted direct-link to {chat.name}.</p>
            </div>
          )}
          
          <div className="video-container remote">
            <video ref={remoteVideoRef} autoPlay playsInline />
            <div className="video-label">{chat.name}</div>
            {!remoteStream && !calling && <div className="no-video">Connection Lost</div>}
          </div>

          <div className="video-container local">
            <video ref={localVideoRef} autoPlay playsInline muted />
            <div className="video-label">You</div>
          </div>
        </div>

        <div className="call-status-footer">
          <div className="secure-badge">
            <Shield size={14} color="#f59e0b" />
            <span>Encrypted Direct Conversation (PeerJS Cloud Signaling Active)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCall;
