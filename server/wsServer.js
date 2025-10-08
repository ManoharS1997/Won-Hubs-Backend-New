const WebSocket = require('ws');
const mysql = require('mysql2');

const dbConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const startWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (socket) => {
    console.log('Client connected');

    const checkHealth = () => {
      const status = { server: 'running', database: 'disconnected' };
      dbConnection.ping((err) => {
        status.database = err ? 'disconnected' : 'connected';
        socket.send(JSON.stringify({ type: 'status', data: status }));
      });
    };

    const interval = setInterval(checkHealth, 5000);

    socket.on('close', () => {
      console.log('Client disconnected');
      clearInterval(interval);
    });
  });

  console.log('WebSocket server started');
};

module.exports = { startWebSocketServer };
