const WebSocket = require('ws');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

const wss = new WebSocket.Server({ port: 8000, clientTracking: true });

function broadcast(message) {
    for (const client of wss.clients) {
        if (client.readyState == WebSocket.OPEN) {
            client.send(message);
        }
    }
}

const port = new SerialPort(process.argv[2]),
    parser = port.pipe(new Readline());

port.on('open', () => {
    broadcast(JSON.stringify({ type: 'status', status: 'open' }));
    console.log('open');
});

port.on('close', err => {
    broadcast(JSON.stringify({ type: 'status', status: 'closed' }));
    broadcast(JSON.stringify({ type: 'error', error: err.toString() }));
    console.log(`closed: ${err.toString()}`);
    setTimeout(() => port.open(), 1000);
});

port.on('error', err => {
    broadcast(JSON.stringify({ type: 'error', error: err.toString() }));
    console.log(`serialport error: ${err.toString()}`);
    if (!port.isOpen) {
        setTimeout(() => port.open(), 1000);
    }
});

parser.on('data', line => {
    let message;

    try {
        const data = JSON.parse(line);
        message = JSON.stringify({ type: 'json', data });
    } catch (e) {
        message = JSON.stringify({ type: 'text', data: line });
    }

    broadcast(message);
});

wss.on('connection', client => {
    client.send(JSON.stringify({ type: 'status', status: port.isOpen ? 'open' : 'closed' }));
});
