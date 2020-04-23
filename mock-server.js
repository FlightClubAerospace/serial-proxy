const WebSocket = require('ws');
const readline = require('readline');

let connected = false;

const wss = new WebSocket.Server({ port: 8000, clientTracking: true });

function broadcast(message) {
    for (const client of wss.clients) {
        if (client.readyState == WebSocket.OPEN) {
            client.send(message);
        }
    }
}

function sendData() {
    setTimeout(sendData, 500);
    if (!connected) return;

    broadcast(JSON.stringify({ type: 'json', data: { altitude: Math.random() * 100 }}));
    broadcast(JSON.stringify({
        type: 'json',
        data: {
            position: {
                latDeg: Math.floor(Math.random() * 360 - 180),
                longDeg: Math.floor(Math.random() * 360 - 180),
                latMin: Math.random() * 60,
                longMin: Math.random() * 60,
                satellites: Math.floor(Math.random() * 3 + 5),
            },
        },
    }));
    broadcast(JSON.stringify({ type: 'json', data: { airspeed: Math.random() * 50 }}));
    // still need orientation...that may end up in a different format

    broadcast(JSON.stringify({
        type: 'json',
        date: {
            orientation: {
                heading: Math.random() * 360,
                pitch: Math.random() * 360,
                roll: Math.random() * 360,
            },
        },
    }));
}

wss.on('connection', client => {
    client.send(JSON.stringify({ type: 'status', connected }));
});

console.log('Listening on port 8000. Press enter to toggle whether port is connected.');
process.stdout.write('Port is disconnected.');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
});

rl.on('line', line => {
    connected = !connected;
    process.stdout.write(`Port is ${connected ? 'connected' : 'disconnected'}.`);
    broadcast(JSON.stringify({ type: 'status', connected }));
});

sendData();
