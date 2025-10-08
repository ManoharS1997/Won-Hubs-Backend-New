// server/queue.js
const { Queue } = require('bullmq');
const workflowQueue = new Queue('workflow');

module.exports = workflowQueue;

