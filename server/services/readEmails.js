const { google } = require('googleapis');
const gmail = google.gmail('v1');

const TOKEN_PATH = path.join(process.cwd(), process.env.TOKEN_FILE_PATH);
const CREDENTIALS_PATH = path.join(process.cwd(), process.env.CREDENTIAL_PATH);
const SECRET_KEY = process.env.SECRET_KEY

// OAuth2 setup (example)
const oauth2Client = new google.auth.OAuth2(
    YOUR_CLIENT_ID,
    YOUR_CLIENT_SECRET,
    YOUR_REDIRECT_URL
);

// Set credentials for the authenticated user
oauth2Client.setCredentials({
    access_token: 'ACCESS_TOKEN',
    refresh_token: 'REFRESH_TOKEN',
});


// OAuth2 client setup
let oAuth2Client;

// Initialize OAuth2 client
function initializeOAuthClient(credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (!oAuth2Client) {
        return res.status(401).json({ error: 'OAuth2 client not initialized' });
    }
    // Check if token is available
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
            return res.status(401).json({ error: 'OAuth2 token not found' });
        }
        oAuth2Client.setCredentials(JSON.parse(token));
        next();
    });
}



/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}



// List new unread emails
gmail.users.messages.list({
    userId: 'me',
    labelIds: ['INBOX'],
    q: 'is:unread',
    auth: oAuth2Client
}, (err, res) => {
    if (err) return console.error('The API returned an error: ' + err);

    const messages = res.data.messages;
    if (messages.length) {
        console.log('New unread emails:', messages);

        // Process each new email
        messages.forEach((message) => {
            gmail.users.messages.get({
                userId: 'me',
                id: message.id,
                auth: oAuth2Client
            }, (err, msg) => {
                if (err) return console.error('Error getting message:', err);

                // Extract the necessary information and create an event
                const emailData = {
                    sender: msg.data.payload.headers.find(header => header.name === 'From').value,
                    subject: msg.data.payload.headers.find(header => header.name === 'Subject').value,
                    body: msg.data.snippet,
                    timestamp: msg.data.internalDate
                };

                console.log('Email data:', emailData);

                // Create an event in your platform
                // Your API call to save the event
            });
        });
    } else {
        console.log('No new emails found.');
    }
});
