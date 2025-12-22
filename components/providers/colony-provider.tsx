"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { colonyLink } from '@/lib/colony-link';
import { toast } from 'sonner';

interface ColonyContextType {
  isConnected: boolean;
  socket: typeof colonyLink.socket;
}

const ColonyContext = createContext<ColonyContextType>({
  isConnected: false,
  socket: null
});

export function ColonyProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (colonyLink.socket) {
      colonyLink.socket.on('connect', () => setIsConnected(true));
      colonyLink.socket.on('disconnect', () => setIsConnected(false));

      setIsConnected(colonyLink.socket.connected);

      // Subscribe to price alerts
      colonyLink.subscribeToAlerts((alert) => {
        toast.success(`🚨 ${alert.coin} Alert: $${alert.price}`, {
          description: alert.message
        });
      });
    }

    return () => {
      colonyLink.socket?.off('connect');
      colonyLink.socket?.off('disconnect');
    };
  }, []);

  return (
    <ColonyContext.Provider value={{ isConnected, socket: colonyLink.socket }}>
      {children}
    </ColonyContext.Provider>
  );
}

export const useColony = () => useContext(ColonyContext);
