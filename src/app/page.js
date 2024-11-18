'use client'
import React, { useState, useEffect, useRef } from 'react';
import styles from "./page.module.css"
import { useRouter } from 'next/navigation'

const Home = () => {
  const router = useRouter()
  const [tempRoomId, setTempRoomId] = useState('');
  const [isRoomCreated, setIsRoomCreated] = useState(false);
  const [joinRoom, setJoinRoom] = useState(false);
  const OnClickFunction = (type) => {
    router.push(`/room/${type}-${tempRoomId}`)
  }

  return (
    <div className={styles.page}>
      <div>
        <h1>Peer-to-Peer File Transfer : )</h1>
        <br></br>
        <h1 onClick={() => { setJoinRoom(false); setIsRoomCreated(true) }}>Click Here to Create Room </h1>

        {isRoomCreated && (
          <>
            <button onClick={() => { OnClickFunction("created") }}>Initiate Room</button>
            <input
              type="text"
              placeholder="Room ID"
              value={tempRoomId}
              onChange={(e) => setTempRoomId(e.target.value)}
            />
          </>
        )}
        <br></br>
        <h1 onClick={() => { setJoinRoom(true); setIsRoomCreated(false) }}> Click Here to Join Room </h1>

        {joinRoom && (
          <>
            <input
              type="text"
              placeholder="Room ID"
              value={tempRoomId}
              onChange={(e) => setTempRoomId(e.target.value)}
            />
            <button onClick={() => { OnClickFunction("joined") }}>Submit</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
