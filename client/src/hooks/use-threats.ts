import { useState, useEffect } from 'react';

interface Threat {
  id: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  location: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export function useThreats() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}/api/threats`);
    
    ws.onopen = () => {
      console.log('Connected to threat feed');
    };

    ws.onmessage = (event) => {
      const threat = JSON.parse(event.data);
      setThreats(prev => [...prev, threat].slice(-100)); // Keep last 100 threats
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  return {
    threats,
    socket
  };
}
