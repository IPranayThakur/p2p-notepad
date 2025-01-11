import React, { useState } from 'react';
import '../CSS/Toggle.css';

// Import your SVG files
import hostIcon from '../assets/host.svg';
import peerIcon from '../assets/peer.svg';

  // Handle the toggle change
  const ToggleSwitch = ({ onChange }) => {
    const [isHost, setIsHost] = useState(false); // Default to 'host'
  
    // Handle the toggle change
    const handleToggleChange = (e) => {
      const newMode = e.target.checked ? 'peer' : 'host'; // Check if toggled to peer or host
      setIsHost(!e.target.checked); // Update local state based on the toggle
      onChange(newMode); // Notify the parent about the change
    };
  
    return (
      <div className="toggle-container">
        <span className={`label ${isHost ? 'active' : ''}`}>Host</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={!isHost} // Set checkbox checked state based on the current mode
            onChange={handleToggleChange} // Handle toggle change
          />
          <span className={`slider ${isHost ? 'host' : 'peer'}`}>
            <span className="toggle-circle"></span>
            <img
              src={isHost ? hostIcon : peerIcon}
              alt={isHost ? 'Host Icon' : 'Peer Icon'}
              className={`toggle-icon ${isHost ? 'active' : ''}`}
            />
          </span>
        </label>
        <span className={`label ${!isHost ? 'active' : ''}`}>Peer</span>
      </div>
    );
  };
  
  export default ToggleSwitch;

