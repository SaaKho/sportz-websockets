import express from "express";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello From Express Server!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
//websockets dont create data they broadcast is we have to make a database we can use neon and drizzle 
//websockets dont create data they only move it faster so if data model is messy the real time data will be messy too so we have to make a database and use drizzle orm to manage it and neon for hosting the database
//database is the source of truth for the data model 
