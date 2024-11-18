'use client'
import styles from "./page.module.css";
import { useEffect, useRef, useState } from "react";
import Peer from 'simple-peer';
import { useParams } from "next/navigation";
export default function Room() {
  const params = useParams()
  const [ws, setWs] = useState(null);
  const [roomId, setRoomId] = useState(params?.roomid.split("-")[1]);
  const [type, setType] = useState(params?.roomid.split("-")[0]);
  const [peer, setPeer] = useState(null);
  const fileInputRef = useRef(null);

  // Create WebSocket connection only when roomId is set
  useEffect(() => {
    if (!roomId) return; // Don't create socket if there's no roomId

    const socket = new WebSocket(`ws://localhost:8080/${roomId}`);
    socket.onopen = () => {
      if (socket && type == "joined") {
        socket.send(JSON.stringify({ type: 'join_room', roomId: roomId }));
      }
      if (socket && type == "created") {
        socket.send(JSON.stringify({ type: 'create_room' }));
      }
    };

    socket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      console.log(data, "line 20")
      switch (data.type) {
        case 'peer_connected-joined':
          initializePeer(message.data, ws); // Responding peer
          break;
        case 'peer_connected-created':
          initializePeer(message.data, ws); // Responding peer
          break;

        case 'signal':
          peer.signal(data.signal, ws);
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
      setWs(null); // Ensure state is updated to null when the socket closes
    };

    setWs(socket);

    return () => {
      socket.close(); // Close WebSocket when component unmounts or roomId changes
    };
  }, [roomId]);

  const initializePeer = (initiator, socket) => {
    console.log("line 59", initiator, socket)
    const newPeer = new Peer({ initiator: initiator.data, trickle: false });

    newPeer.on('signal', (signal) => {
      if (socket) {
        socket.send(JSON.stringify({ type: 'signal', signal, roomId }));
      } else {
        ws.send(JSON.stringify({ type: 'signal', signal, roomId }));
      }
    });

    newPeer.on('connect', () => {
      console.log('Peer connected!');
    });

    newPeer.on('data', (data) => {
      console.log('Received data:', data);
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'received_file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('File downloaded!');
    });

    setPeer(newPeer);
  };


  const sendFile = () => {
    const file = fileInputRef.current.files[0];
    if (file && peer) {
      const reader = new FileReader();

      reader.onload = () => {
        peer.send(reader.result); // Send file data over the peer connection
        console.log('File sent!');
      };

      reader.readAsArrayBuffer(file);
    } else {
      console.log("Peer not initialized or no file selected.");
    }
  };

  return (
    <div className={styles.page}>
      <div>
        <h1>Peer-to-Peer File Transfer</h1>
        {roomId && (
          <div>
            <p>Room ID: {roomId}</p>
            <input type="file" ref={fileInputRef} />
            <button onClick={sendFile}>Send File</button>
          </div>
        )}
      </div>
    </div>
  )
}
