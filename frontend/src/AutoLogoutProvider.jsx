// AutoLogoutProvider.jsx
import React, { createContext, useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AutoLogoutContext = createContext();

export function useAutoLogout() {
  return useContext(AutoLogoutContext);
}

export default function AutoLogoutProvider({ children, expiryMinutes = 30 }) {
  const navigate = useNavigate();
  const [warningVisible, setWarningVisible] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const expiryMs = expiryMinutes * 60 * 1000;
  const warningMs = 30 * 1000; // 30 seconds before logout warning

  // Reset last activity on user interaction
  const resetActivity = () => setLastActivity(Date.now());

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetActivity));

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetActivity));
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = expiryMs - (now - lastActivity);

      if (remaining <= warningMs && !warningVisible) {
        setWarningVisible(true);
      }

      if (remaining <= 0) {
        // Clear localStorage/sessionStorage or any auth tokens here
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastActivity, warningVisible, expiryMs, navigate]);

  const stayLoggedIn = () => {
    setWarningVisible(false);
    setLastActivity(Date.now());
  };

  return (
    <AutoLogoutContext.Provider value={{ stayLoggedIn }}>
      {children}
      {warningVisible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '10px',
              textAlign: 'center',
            }}
          >
            <p>Your session is about to expire!</p>
            <button onClick={stayLoggedIn}>Stay Logged In</button>
          </div>
        </div>
      )}
    </AutoLogoutContext.Provider>
  );
}
