import { useEffect } from 'react';
import './App.css';
import { io } from 'socket.io-client';
import { Canvas } from './components/canvas';

function App() {
  useEffect(() => {
    const socketInstance = io('http://localhost:3000');

    // listen for events emitted by the server
    socketInstance.on('connect', () => {
      console.log('Connected to server');
    });

    socketInstance.on('interval', (data) => {
      console.log(`Received message: ${data}`);
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  return <Canvas />;
}

export default App;
