const fs = require('fs');
const { google } = require('googleapis');
const express = require('express');

const app = express();
const PORT = 3000; // Change this to your desired port

const CREDENTIALS_PATH = 'credentials.json';
const TOKEN_PATH = 'token.json';

// Function to read credentials and initialize OAuth client
function initializeOAuthClient(credentials) {
  const { client_id, client_secret, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if a token already exists
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
  } else {
    console.log('No token found. Please authorize the application.');
    getAccessToken(oAuth2Client, (auth) => {
      startWatch(auth); // Start Gmail watch after authorization
    });
  }

  return oAuth2Client;
}

// Function to start the server and Gmail watch process
function startServer() {
  fs.readFile(CREDENTIALS_PATH, 'utf8', (err, content) => {
    if (err) {
      console.error('Error loading client secret file:', err);
      return;
    }

    const credentials = JSON.parse(content);
    const authClient = initializeOAuthClient(credentials);

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      startWatch(authClient); // Start watching Gmail when the server is ready
    });
  });
}

// Function to obtain access token (called during first-time setup)
function getAccessToken(oAuth2Client, callback) {
  const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']; // Define the required Gmail scopes
  const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
  
  console.log('Authorize this app by visiting this URL:', authUrl);

  // Ask the user for authorization code (in CLI for local testing)
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question('Enter the code from that page here: ', (code) => {
    readline.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token:', err);
      oAuth2Client.setCredentials(token);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token)); // Store the token for future use
      console.log('Token stored to', TOKEN_PATH);
      callback(oAuth2Client);
    });
  });
}

// Gmail watch function (starts watching for new emails)
function startWatch(auth) {
  const gmail = google.gmail({ version: 'v1', auth });

  gmail.users.watch(
    {
      userId: 'me',
      requestBody: {
        topicName: 'projects/won-platform-423505/topics/test-gmail-subscription', // Replace with your Pub/Sub topic
      },
    },
    (err, res) => {
      if (err) return console.error('Error starting Gmail watch:', err);
      console.log('Gmail watch started successfully:', res.data);
    }
  );
}

// Start the server
startServer();
