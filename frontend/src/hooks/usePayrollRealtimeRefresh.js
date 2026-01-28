import { useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';

/**
 * Universal Payroll realtime refresh hook.
 *
 * Mirrors the Dashboard pattern:
 * - keep the latest refresh function in a ref
 * - listen to Socket.IO 'payrollChanged'
 * - trigger refresh when payroll data changes anywhere
 *
 * @param {(payload?: any) => void} refreshFn
 */
export default function usePayrollRealtimeRefresh(refreshFn) {
  const { socket, connected } = useSocket();
  const refreshRef = useRef(null);

  // Keep latest refresh function for Socket.IO handler
  useEffect(() => {
    refreshRef.current = refreshFn;
  });

  // Socket.IO: when payroll-related data changes, refresh the page data
  useEffect(() => {
    if (!socket || !connected) return;

    const handlePayrollChanged = (payload) => {
      if (typeof refreshRef.current === 'function') {
        refreshRef.current(payload);
      }
    };

    socket.on('payrollChanged', handlePayrollChanged);
    return () => {
      socket.off('payrollChanged', handlePayrollChanged);
    };
  }, [socket, connected]);
}

