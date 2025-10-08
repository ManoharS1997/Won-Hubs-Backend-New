// server/workers.js
const { Worker } = require('bullmq');

const workflowWorker = new Worker('workflow', async (job) => {
    const { workflowId } = job.data;
    // Logic to execute the workflow
    console.log(`Executing workflow: ${workflowId}`);
}, {
    connection: {
        host: '127.0.0.1', // Redis host
        port: 6379         // Redis port
    }
});

workflowWorker.on('completed', (job) => {
    console.log(`Job completed with result ${job.returnvalue}`);
});

workflowWorker.on('failed', (job, err) => {
    console.error(`Job failed with error ${err}`);
});
 