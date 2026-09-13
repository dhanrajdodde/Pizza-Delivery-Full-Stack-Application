import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastOrderUpdate, setLastOrderUpdate] = useState(null);
  const [lastAdminNotification, setLastAdminNotification] = useState(null);

  useEffect(() => {
    // In dev, connect to localhost:5000 or relative proxy
    const socketUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Socket connected to PizzaVerse server:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected from server');
      setIsConnected(false);
    });

    socketInstance.on('order_status_updated', (data) => {
      console.log('🔔 [LIVE SOCKET] Order status update received:', data);
      setLastOrderUpdate(data);
    });

    socketInstance.on('new_order_placed', (data) => {
      console.log('🔔 [LIVE SOCKET] New order placed received by admin:', data);
      setLastAdminNotification({ type: 'NEW_ORDER', ...data });
    });

    socketInstance.on('inventory_updated', (data) => {
      console.log('🔔 [LIVE SOCKET] Inventory update received by admin:', data);
      setLastAdminNotification({ type: 'INVENTORY_UPDATE', ...data });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinOrderRoom = (orderId) => {
    if (socket && orderId) {
      socket.emit('join_order_room', orderId);
    }
  };

  const leaveOrderRoom = (orderId) => {
    if (socket && orderId) {
      socket.emit('leave_order_room', orderId);
    }
  };

  const joinAdminRoom = () => {
    if (socket) {
      socket.emit('join_admin_room');
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        lastOrderUpdate,
        lastAdminNotification,
        joinOrderRoom,
        leaveOrderRoom,
        joinAdminRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
