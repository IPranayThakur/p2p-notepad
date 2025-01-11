import React, { useState, useEffect } from "react";
import Peer from "peerjs";
import ToggleSwitch from "./Toggle";
import '../CSS/Notepad.css'; // Make sure to import the CSS


const Notepad = () => {
  const [mode, setMode] = useState("peer"); // "host" or "peer"
  const [peerId, setPeerId] = useState("");
  const [selectedPeerId, setSelectedPeerId] = useState("");
  const [connection, setConnection] = useState(null);
  const [text, setText] = useState("");
  const [peerInstance, setPeerInstance] = useState(null);
  const [status, setStatus] = useState("Disconnected");
  const [statusColor, setStatusColor] = useState("default");
  const [usedPeerIds, setUsedPeerIds] = useState([]);

  const simplePeerIds = [
    "cat", "dog", "bird", "fish", "lion",
    "tree", "leaf", "book", "desk", "lamp",
    "moon", "star", "sun", "rain", "wind"
  ];

  // const getRandomPeerId = () => {
  //   // Filter out peer IDs that are in use
  //   const availableIds = simplePeerIds.filter(id => !usedPeerIds.includes(id));
  //   console.log(availableIds)
  //   // If no available IDs, show an error
  //   if (availableIds.length === 0) {
  //     setStatus("All IDs are in use. Please try again later.");
  //     // throw new Error("All peer IDs are in use.");
  //   }

  //   // Select a random available ID
  //   return availableIds[Math.floor(Math.random() * availableIds.length)];
  // };

  const initializePeer = (id, retryCount = 0) => {
    if (peerInstance) {
      peerInstance.disconnect();
    }

    const peer = new Peer(id);
    setPeerInstance(peer);

    peer.on("open", (id) => {
      setPeerId(id);
      setStatus("Connected as: " + id);
      setStatusColor("success");
      console.log("Your Peer ID:", id);
    });

    peer.on("error", (error) => {
      console.error(error);
      setStatus("Retrying, please wait...");
      setStatusColor("warning");
      if (error.type === 'peer-unavailable') {
        setStatus("Error: Peer not available. They might not be hosting yet.");
        setStatusColor("error");
      }
      if (error.type === 'unavailable-id') {
        console.log(`Error: Peer ID ${id} is unavailable. Retrying with a new ID...`);
        setUsedPeerIds(prev => {
          const newUsedIds = [...prev, id];
          console.log("Updated usedPeerIds:", newUsedIds); // Debug the updated state
          return newUsedIds;
        });
      }
      if (error.type === 'socket-error' && retryCount < 3) {
        setStatus("Retrying connection...");
        setStatusColor("warning");
        console.log("Retrying connection...");
        setTimeout(() => initializePeer(id, retryCount + 1), 2000);  // Retry after 2 seconds
      }
    });

    

    peer.on("connection", (conn) => {
      handleConnection(conn);
    });
  };


  const tryInitializeHost = () => {
    console.log("Used IDs are:", usedPeerIds);
  
    // Ensure we use the most recent state of usedPeerIds
    const availableIds = simplePeerIds.filter(id => !usedPeerIds.includes(id));
    console.log("Available IDs:", availableIds);
  
    // If no available IDs, show an error
    if (availableIds.length === 0) {
      setStatus("All IDs are in use. Please try again later.");
      setStatusColor("error");
      // throw new Error("All peer IDs are in use.");
      if (peerInstance) {
        setPeerId("");
        peerInstance.disconnect();
      }
    } else {
      const randomId = availableIds[Math.floor(Math.random() * availableIds.length)];
      setSelectedPeerId(randomId);
      initializePeer(randomId);
      document.title = "Host - " + randomId;
    }
  };
  
  // Monitor the usedPeerIds state with useEffect and call tryInitializeHost when it changes
  useEffect(() => {
    // Whenever `usedPeerIds` changes, we will retry initializing the host
    if (usedPeerIds.length > 0) {
      console.log("Attempting to initialize host after usedPeerIds change.");
      tryInitializeHost();
    }
  }, [usedPeerIds]);
  


  const handleModeChange = (newMode) => {
    setMode(newMode);
    setConnection(null);
    setText("");  
    if (newMode === "host") {
      tryInitializeHost(); 
    } else {
      // In "peer" mode, initialize with a generic name and no retry logic
      initializePeer("peer_" + Math.random().toString(36).substr(2, 9));
      setStatus("Waiting for Host Selection");
      setStatusColor("warning");
    }
  };
  
  const handleConnection = (conn) => {
    setConnection(conn);
    setStatus("Connected to host: " + conn.peer);

    if (conn.peer.indexOf("peer_") === 0) {
      setStatus("Connected to: " + conn.peer);
    }
    setStatusColor("success");

    conn.on("data", (data) => {
      setText(data);
    });

    conn.on("close", () => {
      setStatus("Connection closed");
      setStatusColor("default");
      setConnection(null);
    });
  };

  const connectToPeer = (remotePeerId) => {
    if (!peerInstance || !remotePeerId) return;
    
    const conn = peerInstance.connect(remotePeerId);
    setStatus("Connecting to: " + remotePeerId);
    setStatusColor("warning");
    
    conn.on("open", () => {
      handleConnection(conn);
    });
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    if (connection) {
      connection.send(newText);
    }
  };

  const handlePeerSelect = (selectedId) => {
    setSelectedPeerId(selectedId);
    if (mode === "peer" && selectedId) {
      connectToPeer(selectedId);
      document.title = "Peer - " + selectedId;
    }
  };

  const handleResyncConnection = () => {
    if (!selectedPeerId) {
      setStatus("No peer selected to resync.");
      setStatusColor("error");
      return;
    }

    console.log("Resyncing connection to peer:", selectedPeerId);
    setStatus("Resyncing connection to: " + selectedPeerId);
    setStatusColor("warning");

    // Attempt to reconnect to the same peer
    connectToPeer(selectedPeerId);
  };


  useEffect(() => {
    // Initialize as peer by default
    handleModeChange("peer");
  }, []);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  // Toggle dark mode on button click
  const toggleDarkMode = () => {
    setIsDarkMode(prevState => !prevState);
  };

  // Apply dark mode to the body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  return (
    <>
    <div className={`app-container ${isDarkMode ? 'dark' : ''}`}>
        <div className="dark-mode-toggle">
          <button className="button" onClick={toggleDarkMode}>
            {isDarkMode ? '🌙' : '🌞'}
          </button>
        </div>
        </div>
    <div className="container">
      <div className="header">
        <h1>Collaborative Notepad</h1>
      </div>

      {/* <div className="radio-group">
        <label className="radio-label">
          <input
            type="radio"
            name="mode"
            value="host"
            checked={mode === "host"}
            onChange={(e) => handleModeChange(e.target.value)}
          />
          Host
        </label>
        <label className="radio-label">
          <input
            type="radio"
            name="mode"
            value="peer"
            checked={mode === "peer"}
            onChange={(e) => handleModeChange(e.target.value)}
          />
          Peer
        </label>
      </div> */}

      <ToggleSwitch onChange={handleModeChange} />

      <div className={`status ${statusColor}`}>
        <p>Status: {status}</p>
        {mode === "host" && <p>Your Host ID: {peerId}</p>}
      </div>

      {mode === "peer" && (
        <>
          <select 
            className="select"
            value={selectedPeerId}
            onChange={(e) => handlePeerSelect(e.target.value)}
          >
            <option value="">Select a Host to connect to</option>
            {simplePeerIds.map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
          <button 
            className="button"
            onClick={handleResyncConnection}
          >
            Resync Connection
          </button>
        </>
      )}

      <textarea
        className="textarea"
        value={text}
        onChange={handleTextChange}
        placeholder="Start typing..."
      />
    </div>
    </>
  );
};

export default Notepad;