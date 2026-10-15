import WebSocket from 'ws';

//create a helper function to send json data to the client
function sendJson(socket, payload){
    if(socket.readyState != WebSocket.OPEN)return ;
    socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload){
    for(const client of wss.clients){
        if(client.readyState != WebSocket.OPEN ) return;
        client.send(JSON.stringify(payload));
    }
}

export function attachWebSocketServer(server){
    const wss = new WebSocket.Server({ 
        server,//this function will receive the http server instance created by express and we will pass it to the websocket, http  will check REST request and ws will look for upgrade requeest, same server helps simplify 
        path: '/ws',//this is the path where the websocket will listen for connections, we can use this to differentiate between different websocket endpoints. Keeps REST request separate from es request 
        maxPayload: 1024 * 1024 * 10,//10mb max payload size, this is to prevent denial of service attacks, we can adjust this based on our needs, acts against security abuse 

     });
     wss.on('connection', (socket) => {
        console.log('New client connected');
        sendJson(socket, { message: 'Welcome to the WebSocket server!' });
        socket.on('error', console.error);
     });

     function broadcastMatchCreated(match){
        broadcast(wss, {type: 'match_created', data: match});

        return{broadcastMatchCreated};

     }


}