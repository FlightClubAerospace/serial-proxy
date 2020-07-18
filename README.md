serial-proxy
============

This repository contains code to make data from a serial port available to one or more clients over a WebSocket connection.

`index.js` is the main server. It listens on WebSocket port 8000 and uses the serial port specified on the command line. For instance, on a typical Linux system:

```sh
$ node index.js /dev/ttyACM0
```

You can run it before the port is connected. It will keep running and continuously report to connected clients whether or not the serial port is connected.

`mock-server.js` provides the same API as the actual server, but it broadcasts fake data in the same format that the microcontroller does.

Messages sent by server
-----------------------

Each WebSocket message that the server sends is a JSON object. It has a `type` property, which is a string that determines which type of message it is, and other properties will be present depending on the type of message. The types of messages are listed below (by the value of `type`).

### Message: `status`

This message indicates whether or not the server has a serial connection open. It is sent once to every client that connects, and again to all connected clients whenever the status changes.

**Property: `connected`**  
Type: boolean  
Whether or not the server has an active serial connection.

### Message: `json`

This message means that the server received a valid JSON value over the serial connection.

**Property: `data`**  
Type: any  
Whatever data was sent by the microcontroller (description of what the microcontroller can send is WIP).

### Message: `text`

This message means that the server received a line of text over the serial connection that was not valid JSON.

**Property: `data`**  
Type: string  
A line of text received by the server.

### Message: `error`

This message means that some error occurred. Often it is sent at the same time as a `status` message indicating that the server lost its serial connection. In that case, this message probably contains the reason for losing the connection.

**Property: `error`**  
Type: string  
The error message.
