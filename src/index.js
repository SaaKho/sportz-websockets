import express from "express";
import { matchesRouter } from "./routes/matches.js";
import http from "http";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app);
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Hello From Express Server!");
});

app.use('/matches', matchesRouter);

const {broadcastMatchCreated} = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(PORT, HOST, () => {
  const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

  console.log(`Server is running on ${baseUrl}`);
  console.log(`WebSocket server is running on ${baseUrl.replace('http', 'ws')}/ws`);
});








//websockets dont create data they broadcast is we have to make a database we can use neon and drizzle 
//websockets dont create data they only move it faster so if data model is messy the real time data will be messy too so we have to make a database and use drizzle orm to manage it and neon for hosting the database
//database is the source of truth for the data model 
