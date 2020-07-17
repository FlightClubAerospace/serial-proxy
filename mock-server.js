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

let latitude = 37.7706,
    longitude = -122.3782,
    direction = Math.random() * 2 * Math.PI,
    speed = 0.001;

function convertToDegreesAndMinutes(input) {
    if (input > 0) {
        const degrees = Math.floor(input),
            remainder = input - degrees;
        return [degrees, remainder * 60];
    } else {
        const degrees = Math.ceil(input),
            remainder = degrees - input;
        return [degrees, remainder * 60];
    }
}

function sendData() {
    setTimeout(sendData, 500);
    if (!connected) return;

    direction += (Math.random() * 0.2) - 0.1;
    latitude += speed * Math.sin(direction);
    longitude += speed * Math.cos(direction);

    const [latDeg, latMin] = convertToDegreesAndMinutes(latitude),
        [longDeg, longMin] = convertToDegreesAndMinutes(longitude);

    broadcast(JSON.stringify({ type: 'json', data: { altitude: Math.random() * 100 }}));
    broadcast(JSON.stringify({
        type: 'json',
        data: {
            position: {
                latDeg,
                longDeg,
                latMin,
                longMin,
                satellites: Math.floor(Math.random() * 3 + 5),
            },
        },
    }));
    broadcast(JSON.stringify({ type: 'json', data: { airspeed: Math.random() * 50 }}));
    // still need orientation...that may end up in a different format

    broadcast(JSON.stringify({
        type: 'json',
        data: {
            orientation: {
                heading: Math.random() * 360 - 180,
                pitch: Math.random() * 360 - 180,
                roll: Math.random() * 360 - 180,
                rollRate: Math.random() * 30 - 15,
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
