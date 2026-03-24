import express from 'express';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
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
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
