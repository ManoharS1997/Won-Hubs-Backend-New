const { google } = require('googleapis');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Gmail and Pub/Sub configurations
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const CREDENTIALS_PATH = 'credentials.json';
const TOKEN_PATH = 'token.json';

// Authorize with Google OAuth
function authorize(callback) {
    const fs = require('fs');
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_id, client_secret, redirect_uris } = credentials.installed;

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    const token = fs.existsSync(TOKEN_PATH) ? JSON.parse(fs.readFileSync(TOKEN_PATH)) : null;

    if (token) {
        oAuth2Client.setCredentials(token);
        callback(oAuth2Client);
    } else {
        getAccessToken(oAuth2Client, callback);
    }
}

// Get a new access token if one is not available
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
    console.log('Authorize this app by visiting this URL:', authUrl);

    // Handle manual authorization for first-time setup
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    readline.question('Enter the code from that page here: ', (code) => {
        readline.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);

            const fs = require('fs');
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
            console.log('Token stored to', TOKEN_PATH);

            callback(oAuth2Client);
        });
    });
}

// Start the Gmail watch process
function startWatch(auth) {
    const gmail = google.gmail({ version: 'v1', auth });

    gmail.users.watch(
        {
            userId: 'me',
            requestBody: {
                topicName: 'projects/your-project-id/topics/gmail-topic', // Replace with your topic
            },
        },
        (err, res) => {
            if (err) return console.error('Error starting watch:', err);
            console.log('Watch response:', res.data);
        }
    )
}

// Handle incoming Pub/Sub notifications
app.post('/gmail-webhook', (req, res) => {
    const pubsubMessage = req.body.message;

    if (!pubsubMessage) {
        res.status(400).send('Bad Request: No Pub/Sub message found.');
        return;
    }

    const data = JSON.parse(Buffer.from(pubsubMessage.data, 'base64').toString());
    console.log('New Gmail notification:', data);

    // Fetch new emails here using their history ID
    const historyId = data.historyId;

    // Use `listHistory` to fetch new emails
    res.status(200).send('Message received and processed');
})

// Fetch new emails using Gmail history
function listNewEmails(auth, historyId) {
    const gmail = google.gmail({ version: 'v1', auth });

    gmail.users.history.list(
        {
            userId: 'me',
            startHistoryId: historyId,
        },
        (err, res) => {
            if (err) return console.error('Error fetching email history:', err);

            const messages = res.data.history || [];
            messages.forEach((historyItem) => {
                if (historyItem.messagesAdded) {
                    historyItem.messagesAdded.forEach((message) => {
                        const messageId = message.message.id;
                        console.log('New email:', messageId);
                        // Fetch detailed email data with `getMessage`
                    });
                }
            });
        }
    );
}

// Initialize the app
app.listen(3000, () => {
    console.log('Server is running on port 3000');
    authorize(startWatch);
})
