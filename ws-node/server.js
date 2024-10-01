const WebSocket = require('ws')
const os = require('os')
require('dotenv').config()

const PORT = process.env.PORT || 5000
const wss = new WebSocket.Server({ port: PORT });
const clients = new Set()

// URL example: ws://my-server?token=my-secret-token
wss.on('connection', (ws, req) => {
    console.log('Client connected');

    // Check valid token (set token in .env as TOKEN=my-secret-token )
    const urlParams = new URLSearchParams(req.url.slice(1));
    if (urlParams.get('token') !== process.env.TOKEN) {
        console.log('Invalid token: ' + urlParams.get('token'));
        ws.send(JSON.stringify({
            status: 1,
            msg: 'ERROR: Invalid token.'
        }));
        ws.close();
    }

    if (!clients.has(ws)) clients.add(ws)
        console.log(`Number of clients: ${clients.size}`)

    ws.on('message', (message) => {
        // Send a response back to the client along with some other info
        clients.forEach(client => {
            let msgString = ""
            if (client === ws) {
                msgString = `Message sent to ${clients.size-1}`
            }

            client.send(JSON.stringify({
                status: 0,
                msg: String(message).toUpperCase(),
                freemem: Math.round(os.freemem() / 1024 / 1024), // MB
                totalmem: Math.round(os.totalmem() / 1024 / 1024), // MB
                clients: msgString
            }));
        });
        
    });

    ws.on("error", () => {
        console.log("unexpected error")
        if (clients.has(ws)) clients.delete(ws)
    })

    ws.on('close', () => {
        clients.delete(ws)
        console.log('Client disconnected');
    });
});
