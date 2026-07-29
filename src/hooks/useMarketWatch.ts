import { useState, useEffect, useRef } from 'react';

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
}

export function useMarketWatch(symbols: string[] = ['btcusdt', 'ethusdt', 'solusdt', 'bnbusdt']) {
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!symbols || symbols.length === 0) return;
    const streamNames = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
    const url = `wss://stream.binance.com:9443/stream?streams=${streamNames}`;

    const connect = () => {
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        if (!payload.data) return;
        const data = payload.data;
        const symbol = data.s.toLowerCase();
        
        setMarketData(prev => ({
          ...prev,
          [symbol]: {
            symbol: data.s,
            price: parseFloat(data.c),
            change: parseFloat(data.P)
          }
        }));
      };

      socket.onclose = () => {
        console.log('Market WebSocket closed. Reconnecting...');
        setTimeout(connect, 3000);
      };

      socket.onerror = (error) => {
        console.error('Market WebSocket error:', error);
        socket.close();
      };
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [symbols.join(',')]);

  return marketData;
}
