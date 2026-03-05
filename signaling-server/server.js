const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const rooms = {};
// Structure: { roomId: Set of clients }

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'join':
                    const roomId = data.room;
                    if (!rooms[roomId]) {
                        rooms[roomId] = new Set();
                    }
                    rooms[roomId].add(ws);
                    ws.roomId = roomId;
                    console.log(`Client joined room ${roomId}`);
                    break;

                case 'signal':
                    const room = rooms[ws.roomId];
                    if (!room) return;

                    // Relay message to other users in room
                    room.forEach(client => {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'signal',
                                signal: data.signal,
                                from: data.from // optional, helpful for debugging
                            }));
                        }
                    });
                    break;
            }
        } catch (e) {
            console.error('Error parsing message:', e);
        }
    });

    ws.on('close', () => {
        const room = rooms[ws.roomId];
        if (room) {
            room.delete(ws);
            if (room.size === 0) {
                delete rooms[ws.roomId];
            }
        }
        console.log('Client disconnected');
    });
});

console.log('Signaling server running on ws://localhost:8080');
