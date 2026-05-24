import express from 'express';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory mock storage if endpoints aren't actually available to connect to live
  // We'll use actual Binance API for live data

  // ==========================================
  // BINANCE API ROUTES (Server-side proxy)
  // ==========================================
  
  // Public Ticker
  app.get('/api/binance/ticker', async (req, res) => {
    try {
      const { symbol } = req.query;
      const targetSymbol = symbol || 'BTCUSDT';
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${targetSymbol}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch ticker data' });
    }
  });

  // Public Order Book (Depth)
  app.get('/api/binance/depth', async (req, res) => {
    try {
      const { symbol, limit } = req.query;
      const targetSymbol = symbol || 'BTCUSDT';
      const targetLimit = limit || 20;
      const response = await fetch(`https://api.binance.com/api/v3/depth?symbol=${targetSymbol}&limit=${targetLimit}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch order book' });
    }
  });

  // Secure Signed Trade Execution (Mocked since we are skipping API keys)
  app.post('/api/binance/trade', async (req, res) => {
    try {
      const { symbol, side, type, quantity, price } = req.body;
      
      // Skipping API Key requirement per user request. 
      // We will mock the successful trade execution response directly.
      const timestamp = Date.now();

      res.json({
        status: 'FILLED',
        orderId: Math.floor(Math.random() * 1000000),
        clientOrderId: `web_client_${Date.now()}`,
        transactTime: timestamp,
        price: price || 'Market',
        origQty: quantity,
        executedQty: quantity,
        symbol: symbol,
        side: side,
        type: type,
        signatureProvided: false // Skipped as requested
      });

    } catch (error) {
      res.status(500).json({ error: 'Failed to execute trade.' });
    }
  });

  // ==========================================
  // BLOCKCHAIN & MINING API ROUTES
  // ==========================================
  
  app.get('/api/blockchain/verify', (req, res) => {
    const { txid } = req.query;
    // Mock blockchain verification
    res.json({
      txid,
      status: 'confirmed',
      confirmations: 12,
      timestamp: Date.now() - 3600000
    });
  });

  app.get('/api/mining/stats', (req, res) => {
    const { pool } = req.query;
    // Mock real-time pool performance
    res.json({
      pool: pool || 'global',
      globalHashrate: '654.32 EH/s',
      networkDifficulty: '83.95 T',
      activeWorkers: Math.floor(Math.random() * 50000) + 100000,
      lastBlockMined: Date.now() - Math.floor(Math.random() * 600000)
    });
  });

  // General Health API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'active', timestamp: new Date().toISOString() });
  });

  // Self-pinging heartbeat to keep the server "warm" and maintain uptime
  const heartbeat = () => {
    // Use local address to avoid external proxy issues and ensure we hit the API directly
    const url = `http://127.0.0.1:${PORT}`;
    fetch(`${url}/api/health`)
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`);
        }
        return res.json();
      })
      .then(data => console.log('Heartbeat successful:', data.timestamp))
      .catch(err => console.error('Heartbeat failed:', err.message));
  };

  // Run heartbeat every 5 minutes
  setInterval(heartbeat, 5 * 60 * 1000);
  // Initial heartbeat after 10 seconds
  setTimeout(heartbeat, 10000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        let template = await fs.promises.readFile(path.join(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
