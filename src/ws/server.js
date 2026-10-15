import { WebSocket, WebSocketServer } from 'ws';

// Send JSON to a single client
function sendJson(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

// Send JSON to every connected client
function broadcast(wss, payload) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;
    client.send(JSON.stringify(payload));
  }
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    // Reuse the Express HTTP server: HTTP handles REST, ws handles upgrade requests
    server,
    // Only accept WebSocket connections on /ws, keeping them separate from REST routes
    path: '/ws',
    // Cap message size (10 MB) to limit abuse
    maxPayload: 10 * 1024 * 1024,
  });

  wss.on('connection', (socket) => {
    socket.isAlive = true;
    socket.on('pong', () => {
      socket.isAlive = true;
    });
    socket.on('error', console.error);

    sendJson(socket, { message: 'Welcome to the WebSocket server!' });
  });

  // Heartbeat: ping every client, drop any that didn't answer the last ping
  const interval = setInterval(() => {
    for (const client of wss.clients) {
      if (client.isAlive === false) {
        client.terminate();
        continue;
      }
      client.isAlive = false;
      client.ping();
    }
  }, 30_000);

  wss.on('close', () => clearInterval(interval));

  function broadcastMatchCreated(match) {
    broadcast(wss, { type: 'match_created', data: match });
  }

  return { broadcastMatchCreated };
}