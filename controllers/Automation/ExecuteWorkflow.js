// Import required dependencies
const axios = require('axios');

/**
 * Main function to execute the integration workflow
 * @param {Object} flowData - The complete flow data from ReactFlow
 * @param {Object} context - Additional context data (user info, auth tokens, etc.)
 * @returns {Promise<Object>} - Results of the workflow execution
 */
async function executeWorkflow(flowData, context) {
  try {
    console.log('Starting workflow execution');

    // Extract nodes and edges from the flow data
    const { nodes, edges } = flowData;
    
    // Create a map of node connections for easy reference
    const nodeConnections = createNodeConnectionsMap(edges);
    
    // Find trigger nodes (starting points of the workflow)
    const triggerNodes = nodes.filter(node => node.data.type === 'trigger');
    
    if (triggerNodes.length === 0) {
      throw new Error('No trigger node found in the workflow');
    }
    
    // Execute workflow starting from each trigger node
    const results = [];
    for (const triggerNode of triggerNodes) {
      const result = await processNode(triggerNode, nodes, nodeConnections, context);
      results.push(result);
    }
    
    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Workflow execution failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Creates a map of connections between nodes
 * @param {Array} edges - Edge data from ReactFlow
 * @returns {Object} - Map of node connections
 */
function createNodeConnectionsMap(edges) {
  const connectionsMap = {};
  
  edges.forEach(edge => {
    if (!connectionsMap[edge.source]) {
      connectionsMap[edge.source] = [];
    }
    connectionsMap[edge.source].push(edge.target);
  });
  
  return connectionsMap;
}

/**
 * Process a single node and its downstream nodes
 * @param {Object} currentNode - Current node to process
 * @param {Array} allNodes - All nodes in the workflow
 * @param {Object} nodeConnections - Map of node connections
 * @param {Object} context - Execution context
 * @param {Object} inputData - Data from previous node
 * @returns {Promise<Object>} - Results of node processing
 */
async function processNode(currentNode, allNodes, nodeConnections, context, inputData = {}) {
  console.log(`Processing node: ${currentNode.id} - ${currentNode.data.label}`);
  
  // Extract node data
  const nodeData = currentNode.data;
  const nodeType = nodeData.type;
  const formData = nodeData.formData || {};
  
  // Process the node based on its type
  let nodeResult;
  
  try {
    if (nodeType === 'trigger') {
      nodeResult = await executeTrigger(formData, context);
    } else if (nodeType === 'action') {
      nodeResult = await executeAction(formData, context, inputData);
    } else {
      throw new Error(`Unknown node type: ${nodeType}`);
    }
    
    // Process downstream nodes
    const nextNodeIds = nodeConnections[currentNode.id] || [];
    const nextResults = [];
    
    for (const nextNodeId of nextNodeIds) {
      const nextNode = allNodes.find(node => node.id === nextNodeId);
      if (nextNode) {
        const nextResult = await processNode(nextNode, allNodes, nodeConnections, context, nodeResult);
        nextResults.push(nextResult);
      }
    }
    
    return {
      nodeId: currentNode.id,
      nodeType,
      label: currentNode.data.label,
      result: nodeResult,
      nextResults
    };
  } catch (error) {
    console.error(`Error processing node ${currentNode.id}:`, error);
    return {
      nodeId: currentNode.id,
      nodeType,
      label: currentNode.data.label,
      error: error.message
    };
  }
}

/**
 * Execute a trigger node
 * @param {Object} formData - Form data from the trigger node
 * @param {Object} context - Execution context
 * @returns {Promise<Object>} - Trigger execution result
 */
async function executeTrigger(formData, context) {
  const { app, event, configure } = formData;
  
  // Handle different trigger types based on app and event
  if (app === 'Slack' && event === 'New Message Posted to Channel') {
    return await slackNewMessageTrigger(configure, context);
  }
  
  throw new Error(`Unsupported trigger: ${app} - ${event}`);
}

/**
 * Execute an action node
 * @param {Object} formData - Form data from the action node
 * @param {Object} context - Execution context
 * @param {Object} inputData - Data from previous node
 * @returns {Promise<Object>} - Action execution result
 */
async function executeAction(formData, context, inputData) {
  const { app, event, configure } = formData;
  
  // Handle different action types based on app and event
  if (app === 'Slack' && event === 'Raise A Ticket in Wonhubs by Hashtag') {
    return await slackRaiseTicketAction(configure, context, inputData);
  }
  
  throw new Error(`Unsupported action: ${app} - ${event}`);
}

/**
 * Implementation of Slack New Message trigger
 * @param {Object} config - Trigger configuration
 * @param {Object} context - Execution context
 * @returns {Promise<Object>} - Trigger result
 */
async function slackNewMessageTrigger(config, context) {
  try {
    const channelId = config.channel.value;
    const includeBotMessages = config['Trigger For Bot Messages']?.value || false;
    
    console.log(`Fetching messages from Slack channel: ${channelId}`);
    
    // Call Slack API to fetch latest messages
    // This would normally use a Slack SDK or API client
    const response = await axios.post(
      'http://your-api-server/api/slack/messages', 
      {
        channelId,
        includeBotMessages,
        userId: context.userId
      },
      {
        headers: {
          'Authorization': `Bearer ${context.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Process and return the messages
    const messages = response.data.messages || [];
    
    return {
      success: true,
      messages: messages.slice(0, 2), // Get latest 2 messages as specified
      metadata: {
        channelId,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error in Slack new message trigger:', error);
    throw new Error(`Slack trigger failed: ${error.message}`);
  }
}

/**
 * Implementation of Slack Raise Ticket action
 * @param {Object} config - Action configuration
 * @param {Object} context - Execution context
 * @param {Object} inputData - Data from previous node
 * @returns {Promise<Object>} - Action result
 */
async function slackRaiseTicketAction(config, context, inputData) {
  try {
    const hashtag = config.Hashtag.value;
    const channelId = config.channel.value;
    const importToCore = config['Import to Core Table']?.value || false;
    
    console.log(`Raising ticket with hashtag: ${hashtag}`);
    
    // Check for hashtag in messages from input data
    const messages = inputData.messages || [];
    const messageWithHashtag = messages.find(msg => msg.text && msg.text.includes(`#${hashtag}`));
    
    if (!messageWithHashtag) {
      return {
        success: false,
        reason: `No message with hashtag #${hashtag} found`
      };
    }
    
    // Create ticket in Wonhubs
    const ticketResponse = await axios.post(
      'http://your-api-server/api/wonhubs/tickets', 
      {
        messageId: messageWithHashtag.ts,
        channelId,
        messageText: messageWithHashtag.text,
        hashtag,
        importToCore,
        userId: context.userId
      },
      {
        headers: {
          'Authorization': `Bearer ${context.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      success: true,
      ticket: ticketResponse.data.ticket,
      metadata: {
        messageId: messageWithHashtag.ts,
        hashtag,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error in Slack raise ticket action:', error);
    throw new Error(`Raise ticket action failed: ${error.message}`);
  }
}

module.exports = {
  executeWorkflow
};