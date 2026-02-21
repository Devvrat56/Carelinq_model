import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneOff, Maximize, Mic, MicOff, Video, VideoOff, Settings, Users, MessageSquare } from 'lucide-react';
import './VideoCall.css';

const VideoCall = ({ chat, currentUser, onEndCall }) => {
  const jitsiContainerRef = useRef(null);
  const [api, setApi] = useState(null);

  useEffect(() => {
    // Generate a unique room name based on the two participants
    // We sort the IDs to ensure both participants join the same room
    const participants = [currentUser.id, chat.id].sort();
    const roomName = `MediLink_Room_${participants[0]}_${participants[1]}`;

    const domain = "meet.ffmuc.net";
    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        email: currentUser.email,
        displayName: currentUser.name
      },
      configOverwrite: {
        startWithAudioMuted: false,
        disableDeepLinking: true,
        prejoinPageEnabled: false,
        toolbarButtons: [
           'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
           'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
           'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
           'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
           'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
           'security'
        ],
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_REMOTE_DISPLAY_NAME: chat.name,
      }
    };

    if (!window.JitsiMeetExternalAPI) {
      alert("Video conferencing library is still loading. Please try again in a moment.");
      onEndCall();
      return;
    }

    const newApi = new window.JitsiMeetExternalAPI(domain, options);
    
    newApi.addEventListeners({
      readyToClose: () => {
        onEndCall();
      },
      videoConferenceLeft: () => {
        onEndCall();
      }
    });

    setApi(newApi);

    return () => {
      if (newApi) newApi.dispose();
    };
  }, []);

  return (
    <motion.div 
      className="video-call-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="call-page-container">
        <div className="custom-call-header">
           <div className="call-branding">
              <div className="teams-mini-logo">T</div>
              <span>Teams Meeting - {chat.name}</span>
           </div>
           <div className="call-actions-top">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Meeting invitation link copied! You can now paste this into an email.");
                }} 
                className="share-call-btn"
                title="Copy link for email"
              >
                Share link
              </button>
              <button onClick={onEndCall} className="exit-call-btn">
                <PhoneOff size={18} /> Exit
              </button>
           </div>
        </div>
        
        <div className="jitsi-wrapper" ref={jitsiContainerRef}>
          {/* Jitsi Meet IFrame will be injected here */}
        </div>

        <div className="call-status-footer">
          <div className="secure-badge">
            <Users size={14} />
            <span>Encrypted Room: {currentUser.email} & {chat.email}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCall;
