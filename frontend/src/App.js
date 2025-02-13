import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Backend URL

function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Listen for messages
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Listen for room users
    socket.on('room_users', (data) => {
      setUsers(data.users);
    });

    // Listen for user left
    socket.on('user_left', (data) => {
      setMessages((prev) => [...prev, { username: 'System', message: `${data.username} left the room` }]);
    });

    return () => {
      socket.off('receive_message');
      socket.off('room_users');
      socket.off('user_left');
    };
  }, []);

  const joinRoom = () => {
    if (username && room) {
      socket.emit('join_room', { username, room });
    }
  };

  const sendMessage = () => {
    if (message) {
      const data = { username, room, message };
      socket.emit('send_message', data);
      setMessages((prev) => [...prev, data]);
      setMessage('');
    }
  };

  return (
    <div>
      <h1>WePlay</h1>
      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="Room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>
      <div>
        <h2>Room: {room}</h2>
        <div>
          <h3>Users in Room:</h3>
          <ul>
            {users.map((user, index) => (
              <li key={index}>{user.username}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Messages:</h3>
          <ul>
            {messages.map((msg, index) => (
              <li key={index}>
                <strong>{msg.username}:</strong> {msg.message}
              </li>
            ))}
          </ul>
        </div>
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;