import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { initApiLogger } from './lib/apiLogger.ts';
import { SocketProvider } from './context/SocketContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { UserProfileProvider } from './context/UserProfileContext.tsx';

// Initialize Client-side API Debugger
initApiLogger();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <UserProfileProvider>
        <SocketProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </SocketProvider>
      </UserProfileProvider>
    </BrowserRouter>
  </StrictMode>
);