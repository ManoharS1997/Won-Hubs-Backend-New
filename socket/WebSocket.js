const connectedClients = new Set();

function addClient(socket) {
  connectedClients.add(socket);
}

function removeClient(socket) {
  connectedClients.delete(socket);
}

function getConnectedClients() {
  return connectedClients;
}

module.exports = {
  addClient,
  removeClient,
  getConnectedClients,
};
