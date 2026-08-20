import express from 'express';
import http from 'http';
import cors from 'cors';
import { PORT } from './config/env.js';
import { setupCallWebSocket } from './websocket/callHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Voice Health Screener Server is running' });
});

const server = http.createServer(app);

// Attach WebSocket handler to the HTTP server
setupCallWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket Server initialized`);
});