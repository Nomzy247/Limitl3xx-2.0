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
    let isMounted = true;
    const streamNames = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
    const url = `wss://stream.binance.com/stream?streams=${streamNames}`;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      if (!isMounted) return;
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        if (!payload.data) return;
        const data = payload.data;
        const symbol = data.s.toLowerCase();
        
        if (isMounted) {
          setMarketData(prev => ({
            ...prev,
            [symbol]: {
              symbol: data.s,
              price: parseFloat(data.c),
              change: parseFloat(data.P)
            }
          }));
        }
      };

      socket.onclose = () => {
        if (isMounted) {
          console.log('Market WebSocket closed. Reconnecting...');
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };

      socket.onerror = (error) => {
        console.warn('Market WebSocket error occurred.');
        socket.close();
      };
    };

    connect();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimeout);
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        socketRef.current.onmessage = null;
        socketRef.current.close();
      }
    };
  }, [symbols.join(',')]);

  return marketData;
}
