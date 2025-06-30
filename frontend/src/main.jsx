// Import react core and rendering modules
import React from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter } from 'react-router-dom';

// Redux provider for state management
import { Provider, useSelector } from 'react-redux';   // ⬅️ useSelector added

// Import app which defines app structure and routes
import App from './App';

import store from './app/store';

// Imports all tailwind css for app
import './index.css';

// --- Socket.IO ---
import { socket } from './utils/socket';
import { useEffect } from 'react';

// Small wrapper component to initialise socket after auth
function SocketInitializer({ children }) {
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?._id) {
      socket.emit('setup', user._id);   // join personal room
    }
  }, [user]);

  return children;
}
// --- Socket.IO ---

// Creates DOM
ReactDOM.createRoot(document.getElementById('root')).render(
  // Provider connects react and redux in the app
  // BrowserRouter allows client-side routing (change without reload)
  // App contains routes and layout
  <Provider store={store}>
    <BrowserRouter>
      {/* --- Socket.IO --- */}
      <SocketInitializer>
        <App />
      </SocketInitializer>
      {/* --- Socket.IO --- */}
    </BrowserRouter>
  </Provider>
);
