import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API } from '@/config/api';
import { AUTH_CHANGED_EVENT } from '@/lib/auth';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

function isSignedIn() {
  return Boolean(localStorage.getItem('token') && localStorage.getItem('userRole'));
}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const backendUrl = API.replace(/\/api$/, '');
    const newSocket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      withCredentials: true,
      auth: (cb) => cb({ token: localStorage.getItem('token') || undefined }),
    });

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));
    newSocket.on('connect_error', () => setIsConnected(false));

    newSocket.on('appointment_request', (data: any) => {
      window.dispatchEvent(new CustomEvent('new-appointment-request', { detail: data }));
    });

    newSocket.on('appointment_updated', (data: any) => {
      window.dispatchEvent(new CustomEvent('doctor-appointments-changed', { detail: data }));
    });

    newSocket.on('appointment_status_updated', (data: any) => {
      window.dispatchEvent(new CustomEvent('appointment-status-changed', { detail: data }));
    });

    const syncWithSession = () => {
      newSocket.disconnect();
      if (isSignedIn()) newSocket.connect();
    };

    setSocket(newSocket);
    syncWithSession();
    window.addEventListener(AUTH_CHANGED_EVENT, syncWithSession);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncWithSession);
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
