// Description: It has all the controller functions to fetch the slack channel details, conversation history, query matched messages, users, files, mentions, recent channels, latest messages from private channel, and send direct messages to the user.
// All the controller functions are async and return the response object.
const { WebClient, LogLevel } = require("@slack/web-api");
require('dotenv').config();
const { db } = require("../../config/DB-connection");

let conversationsStore = {};
let conversationHistory;

let client;
const connectClient = async (botToken) => {
    client = new WebClient(botToken, {
        logLevel: LogLevel.DEBUG,
    });
}

const saveConversations = (conversationsArray) => {
    conversationsArray.forEach(conversation => {
        conversationsStore[conversation.id] = conversation;
    });
};

const getBotTokenByUserId = async (ID) => {
    try {
        const query = `SELECT api_token FROM wonhubs.connections WHERE creator = ?`
        const [result] = await db.query(query, [ID]);
        return result[0].api_token
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// ----------------------------------------------------------------- controller functions -----------------------------------------------------------------

const testConnection= async (req, res) => {
    try {
        const { TOKEN, WEBHOOK } = req.body
        // console.log('slackToken', TOKEN)
        const URL = 'https://slack.com/api/auth.test'
        const options = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        }
        const response = await fetch(URL, options)
        const data = await response.json()

        const webhookResponse = await fetch(WEBHOOK, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "text": "Hello, this is a test message from WONHUBS!" })
        })
        // const webhookData = await webhookResponse.json()
        console.log(webhookResponse)

        res.json({ testResponse: data, webhookResponse: webhookResponse.ok })
    } catch (err) {
        console.log(err)
    }
}

// controller function to fetch all the conversations from the slack channel
// this function will be called when the user clicks on the slack channel to fetch all the conversations from the slack channel
const populateConversationStore = async (req, res, next) => {
    const botToken = await getBotTokenByUserId(req.body.userId)
    try {
        await connectClient(botToken);
        const result = await client.conversations.list();

        if (!result.ok) {
            throw new Error(`Slack API error: ${result.error}`);
        }

        saveConversations(result.channels);
        const channelsData = result?.channels.reduce((acc, cur) => {
            acc.push({ id: cur.id, name: cur.name })
            return acc
        }, [])
        return res.status(200).json({ success: true, message: 'Channels list fetched successfully', data: channelsData })
    } catch (error) {
        console.error("Error fetching channels list:", error.message);
        return res.status(500).json({ success: false, message: "Failed to fetch channels list." })
    }
};
// controller function to fetch the conversation history of the slack channel
// this function will be called when the user clicks on the slack channel to fetch the conversation history of the slack channel
const fetchConversationHistory = async (req, res, next) => {
    const botToken = await getBotTokenByUserId(req.body.userId);
    const { channelId } = req.params;
    try {
        await connectClient(botToken);
        const result = await client.conversations.history({
            channel: channelId,
            limit: 2
        });

        conversationHistory = result.messages;

        // console.log(conversationHistory.length + " messages found in " + channelId);
        return res.status(200).json({ success: true, message: "Conversation fetched successfully.", data: conversationHistory })
    }
    catch (error) {
        console.error("Error fetching conversation", error);
        return res.status(500).json({ success: false, message: "Failed to fetch conversation." })
    }
}
// controller function to fetch the messages that match the query from the slack channel
// this function will be called when the user searches for a query in the slack channel
const fetchQueryMatchMessages = async (req, res, next) => {
    const { userToken } = req.body
    const { query, count } = req.params
    console.log('hitting', query, count);

    try {
        const url = `https://slack.com/api/search.messages?query=${query}&${count}`
        const options = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${userToken || process.env.SLACK_USER_TOKEN}`,
                'Content-Type': 'application/json'
            }
        }
        const response = await fetch(url, options)
        const data = await response.json()
        // console.log(data)
        return res.status(200).json({ success: true, messages: data.messages.matches })
    } catch (err) {
        console.log('error fetching query matched messages from slack channel: ', err)
    }
}
// controller function to fetch all the users from the slack channel
// this function will be called when the user clicks on the slack channel to fetch all the users from the slack channel 
const getAllUsersFromSlackChannel = async (req, res, next) => {
    const botToken = await getBotTokenByUserId(req.body.userId)
    const { channelId } = req.params;
    console.log('getting users from:', channelId);

    try {
        const url = `https://slack.com/api/conversations.members?channel=${channelId}`
        const options = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${botToken || process.env.SLACK_BOT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        }
        const response = await fetch(url, options)
        const data = await response.json()
        const members = await Promise.all(data.members.map(async (member) => {
            const user = await fetch(`https://slack.com/api/users.info?user=${member}`, options)
            const userData = await user.json()
            return { id: userData.user.id, name: userData.user.real_name }
        }))
        // console.log(members)
        return res.status(200).json({ success: true, data: members })
    } catch (err) {
        console.log('error fetching users from slack channel: ', err)
    }
}
// controller function to fetch all the users from the workspace
// this function will be called when the user clicks on the slack channel to fetch all the users from the workspace
const getAllUsersFromWorkspace = async (req, res, next) => {
    const botToken = await getBotTokenByUserId(req.body.userId);
    console.log('Fetching all users from the workspace:', botToken, req.body.userId);

    try {
        const url = `https://slack.com/api/users.list`;
        const options = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${botToken || process.env.SLACK_BOT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await fetch(url, options);
        const data = await response.json();

        if (!data.ok) {
            throw new Error(data.error || 'Failed to fetch users');
        }

        const users = data.members.map(user => ({
            id: user.id,
            name: user.real_name,
            email: user.profile.email,
            is_bot: user.is_bot,
            is_admin: user.is_admin,
            is_owner: user.is_owner
        }));

        return res.status(200).json({ success: true, data: users });
    } catch (err) {
        console.log('Error fetching users from workspace: ', err);
        return res.status(500).json({ success: false, message: 'Error fetching users', error: err.message });
    }
};

// controller function to fetch the latest files created by the user
// this function will be called when the user clicks on the slack channel to fetch the latest files created by the user
const getLatestFilesCreatedByUser = async (req, res, next) => {
    console.log('user id:', req.body.userId)
    const botToken = await getBotTokenByUserId(req.body.userId)
    const { channelId } = req.params
    try {
        const url = `https://slack.com/api/files.list?channel=${channelId}&limit=2`
        const options = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${botToken || process.env.SLACK_BOT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        }
        const response = await fetch(url, options)
        const data = await response.json()
        return res.status(200).json({ success: true, files: data.files })
    } catch (err) {
        console.log('error fetching files from slack channel: ', err)
    }
}
// controller function to fetch the mentions from the slack channel
// this function will be called when the user clicks on the slack channel to fetch the mentions from the slack channel
const getMentionsFromAllChannels = async (req, res, next) => {
    const botToken = await getBotTokenByUserId(req.body.userId);
    console.log('Fetching mentions from all accessible channels');

    try {
        // Step 1: Get all channels where the bot is a member
        const channelsUrl = `https://slack.com/api/conversations.list`;
        const options = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${botToken || process.env.SLACK_BOT_TOKEN}`,
                'Content-Type': 'application/json',
            },
        };

        const channelsResponse = await fetch(channelsUrl, options);
        const channelsData = await channelsResponse.json();

        if (!channelsData.ok) {
            throw new Error(channelsData.error || 'Failed to fetch channels');
        }

        const channels = channelsData.channels.map((channel) => channel.id);
        let mentions = [];

        // Step 2: Iterate through each channel and fetch messages
        for (const channelId of channels) {
            const messagesUrl = `https://slack.com/api/conversations.history?channel=${channelId}`;
            const messagesResponse = await fetch(messagesUrl, options);
            const messagesData = await messagesResponse.json();

            if (messagesData.ok && messagesData.messages.length > 0) {
                messagesData.messages.forEach((message) => {
                    const matches = message.text?.match(/<@([A-Z0-9]+)>/g);
                    if (matches) {
                        matches.forEach((mention) => {
                            const userId = mention.replace(/[<@>]/g, '');
                            mentions.push({ userId, channel: channelId, message: message.text });
                        });
                    }
                });
            }
        }

        return res.status(200).json({ success: true, mentions });
    } catch (err) {
        console.log('Error fetching mentions: ', err);
        return res.status(500).json({ success: false, message: 'Error fetching mentions', error: err.message });
    }
};

// controller function to fetch the recent channels
// this function will be called when the user clicks on the slack channel to fetch the recent channels
const getRecentChannels = async (req, res, next) => {
    const botToken = await getBotTokenByUserId(req.body.userId);
    console.log('Fetching recent channels with creator details');

    try {
        // Step 1: Get the list of all channels the bot has access to
        const channelsUrl = `https://slack.com/api/conversations.list?types=public_channel,private_channel`;
        const options = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${botToken || process.env.SLACK_BOT_TOKEN}`,
                'Content-Type': 'application/json',
            },
        };

        const channelsResponse = await fetch(channelsUrl, options);
        const channelsData = await channelsResponse.json();

        if (!channelsData.ok) {
            throw new Error(channelsData.error || 'Failed to fetch channels');
        }

        let channels = channelsData.channels;

        // Step 2: Get recent activity and creator details for each channel
        const recentChannels = await Promise.all(
            channels.map(async (channel) => {
                const historyUrl = `https://slack.com/api/conversations.history?channel=${channel.id}&limit=1`;
                const historyResponse = await fetch(historyUrl, options);
                const historyData = await historyResponse.json();
                const latest = historyData.ok && historyData.messages.length > 0 ? historyData.messages[0].ts : '0';

                // Fetch creator details
                const creatorUrl = `https://slack.com/api/users.info?user=${channel.creator}`;
                const creatorResponse = await fetch(creatorUrl, options);
                const creatorData = await creatorResponse.json();
                const creator = creatorData.ok ? creatorData.user : null;

                return {
                    id: channel.id,
                    name: channel.name,
                    created: channel.created,
                    creator: {
                        id: creator?.id || 'N/A',
                        name: creator?.name || 'N/A',
                        real_name: creator?.real_name || 'N/A',
                        profile: {
                            phone: creator?.profile?.phone || 'N/A',
                            email: creator?.profile?.email || 'N/A',
                            first_name: creator?.profile?.first_name || 'N/A',
                            last_name: creator?.profile?.last_name || 'N/A',
                            image_small: creator?.profile?.image_24 || 'N/A',
                            image_medium: creator?.profile?.image_72 || 'N/A',
                            image_large: creator?.profile?.image_1024 || 'N/A'
                        },
                        is_restricted: creator?.is_restricted || false,
                        is_ultra_restricted: creator?.is_ultra_restricted || false,
                        is_bot: creator?.is_bot || false
                    },
                    latest
                };
            })
        );

        // Step 3: Sort channels by latest activity timestamp (most recent first)
        recentChannels.sort((a, b) => parseFloat(b.latest) - parseFloat(a.latest));

        return res.status(200).json({ success: true, channels: recentChannels });
    } catch (err) {
        console.log('Error fetching recent channels: ', err);
        return res.status(500).json({ success: false, message: 'Error fetching recent channels', error: err.message });
    }
};

// controller function to fetch the latest messages from the private channel
// this function will be called when the user clicks on the slack channel to fetch the latest messages from the private channel
const getLatestMessagesFromPrivateChannel = async (req, res, next) => {
    const botToken = await getBotTokenByUserId(req.body.userId);
    const { channelId } = req.params;
    console.log(`Fetching latest 2 messages from private channel: ${channelId}`);

    try {
        const url = `https://slack.com/api/conversations.history?channel=${channelId}&limit=2`;
        const options = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${botToken || process.env.SLACK_BOT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await fetch(url, options);
        const data = await response.json();

        if (!data.ok) {
            throw new Error(data.error || 'Failed to fetch messages');
        }

        const teamInfoUrl = `https://slack.com/api/team.info`;
        const teamResponse = await fetch(teamInfoUrl, options);
        const teamData = await teamResponse.json();
        const team = teamData.ok ? teamData.team : null;

        const channelInfoUrl = `https://slack.com/api/conversations.info?channel=${channelId}`;
        const channelResponse = await fetch(channelInfoUrl, options);
        const channelData = await channelResponse.json();
        const channel = channelData.ok ? channelData.channel : null;

        const messages = await Promise.all(data.messages.map(async (message) => {
            const userInfoUrl = `https://slack.com/api/users.info?user=${message.user}`;
            const userResponse = await fetch(userInfoUrl, options);
            const userData = await userResponse.json();
            const user = userData.ok ? userData.user : null;

            return {
                user: {
                    id: user?.id || 'N/A',
                    name: user?.name || 'N/A',
                    real_name: user?.real_name || 'N/A',
                    profile: {
                        phone: user?.profile?.phone || 'N/A',
                        email: user?.profile?.email || 'N/A',
                        first_name: user?.profile?.first_name || 'N/A',
                        last_name: user?.profile?.last_name || 'N/A',
                        image_small: user?.profile?.image_24 || 'N/A',
                        image_medium: user?.profile?.image_72 || 'N/A',
                        image_large: user?.profile?.image_1024 || 'N/A'
                    },
                    is_restricted: user?.is_restricted || false,
                    is_ultra_restricted: user?.is_ultra_restricted || false,
                    is_bot: user?.is_bot || false
                },
                ts: message.ts,
                text: message.text,
                channel: {
                    id: channel?.id || 'N/A',
                    name: channel?.name || 'N/A'
                },
                thread_ts: message.thread_ts || message.ts,
                permalink: `https://${team?.domain}.slack.com/archives/${channelId}/p${message.ts.replace('.', '')}`,
                team: {
                    id: team?.id || 'N/A',
                    name: team?.name || 'N/A',
                    url: `https://${team?.domain}.slack.com/` || 'N/A',
                    domain: team?.domain || 'N/A',
                    email_domain: team?.email_domain || 'N/A',
                    icon: {
                        image_small: team?.icon?.image_34 || 'N/A',
                        image_medium: team?.icon?.image_88 || 'N/A',
                        image_large: team?.icon?.image_230 || 'N/A',
                        avatar_base_url: 'https://ca.slack-edge.com/'
                    },
                    is_verified: team?.is_verified || false,
                    lob_sales_home_enabled: team?.lob_sales_home_enabled || false
                },
                raw_text: message.text,
                ts_time: new Date(parseFloat(message.ts) * 1000).toISOString(),
                thread_ts_time: new Date(parseFloat(message.thread_ts || message.ts) * 1000).toISOString()
            };
        }));

        return res.status(200).json({ success: true, messages });
    } catch (err) {
        console.log('Error fetching messages:', err);
        return res.status(500).json({ success: false, message: 'Error fetching messages', error: err.message });
    }
};

// controller function to send a direct message to the user
// this function will be called when the user sends a direct message to the user
const sendDirectMessage = async (req, res, next) => {
    try {
        const { userId, message, channelUsers, sentAsBot, attachImageUrl, linkUsernames, scheduledAt } = req.body;

        // Fetch the bot token using userId (This userId is NOT the Slack user ID)
        const botToken = await getBotTokenByUserId(userId);

        if (!botToken) {
            return res.status(400).json({ success: false, message: 'Bot token not found' });
        }
        console.log(channelUsers)
        // Ensure channelUsers is an array (for multiple users support)
        if (!channelUsers || !Array.isArray(channelUsers) || channelUsers.length === 0) {
            return res.status(400).json({ success: false, message: 'Slack User IDs not provided' });
        }

        // Step 1: Open DM Channels for each user
        let dmChannelIds = [];
        for (const slackUserId of channelUsers) {
            const openDmResponse = await fetch('https://slack.com/api/conversations.open', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${botToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ users: slackUserId })
            });

            const openDmData = await openDmResponse.json();

            if (!openDmData.ok || !openDmData.channel?.id) {
                console.error(`Failed to open DM with ${slackUserId}:`, openDmData.error);
                continue; // Skip this user and proceed with others
            }

            dmChannelIds.push(openDmData.channel.id);
        }

        if (dmChannelIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Failed to open any DM channels' });
        }

        // Step 2: Prepare Message Payload
        let messagePayload = {
            text: message,
            link_names: linkUsernames ? true : false, // Enable username/channel linking if requested
            unfurl_links: true,
            unfurl_media: true
        };

        // If sending as a bot (override username)
        if (sentAsBot) {
            messagePayload.username = 'Custom Bot Name';
            messagePayload.icon_emoji = ':robot_face:'; // Set a bot icon (optional)
        }

        // If attaching an image
        if (attachImageUrl) {
            messagePayload.attachments = [
                {
                    image_url: attachImageUrl,
                    text: `Attached Image: ${attachImageUrl}`,
                    fallback: "An image attachment",
                    color: "#36a64f"
                }
            ];
        }

        // Step 3: Send or Schedule Messages
        let messageResponses = [];
        for (const dmChannelId of dmChannelIds) {
            let sendMessageOptions = {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${botToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    channel: dmChannelId,
                    ...messagePayload,
                    ...(scheduledAt ? { post_at: Math.floor(new Date(scheduledAt).getTime() / 1000) } : {}) // Schedule message if set
                })
            };

            const sendMessageResponse = await fetch(
                scheduledAt ? 'https://slack.com/api/chat.scheduleMessage' : 'https://slack.com/api/chat.postMessage',
                sendMessageOptions
            );

            const sendMessageData = await sendMessageResponse.json();

            if (!sendMessageData.ok) {
                console.error(`Failed to send message to ${dmChannelId}:`, sendMessageData.error);
                continue; // Skip failed messages
            }

            messageResponses.push(sendMessageData);
        }

        if (messageResponses.length === 0) {
            return res.status(400).json({ success: false, message: 'Failed to send messages' });
        }

        return res.status(200).json({ success: true, message: 'Messages sent successfully', data: messageResponses });
    } catch (err) {
        console.error('Error sending DM:', err.message);
        return res.status(500).json({ success: false, message: 'Error sending message', error: err.message });
    }
};

const getLatestMessagesWithHashtags = async (req, res, next) => {
    const { channelId, hashtags, userId } = req.body; // Extract channelId, hashtags (comma-separated), and userId
    const botToken = await getBotTokenByUserId(userId); // Fetch the bot token dynamically

    console.log(`Fetching the latest messages with hashtags ${hashtags} from channel: ${channelId}`);

    try {
        // Convert hashtag string to an array and trim spaces
        const hashtagList = hashtags.split(',').map(tag => tag.trim());

        // 1. Fetch latest 20 messages from the Slack channel
        const url = `https://slack.com/api/conversations.history?channel=${channelId}&limit=20`;
        const options = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${botToken || process.env.SLACK_BOT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await fetch(url, options);
        const data = await response.json();

        if (!data.ok) {
            throw new Error(data.error || 'Failed to fetch messages');
        }

        // 2. Filter messages that contain at least one of the hashtags
        const filteredMessages = data.messages.filter(message =>
            message.text && hashtagList.some(tag => message.text.includes('#' + tag))
        );

        if (filteredMessages.length === 0) {
            return res.status(404).json({ success: false, message: `No messages found with hashtags: ${hashtags}` });
        }

        // 3. Fetch team details
        const teamInfoUrl = `https://slack.com/api/team.info`;
        const teamResponse = await fetch(teamInfoUrl, options);
        const teamData = await teamResponse.json();
        const team = teamData.ok ? teamData.team : null;

        // 4. Fetch channel details
        const channelInfoUrl = `https://slack.com/api/conversations.info?channel=${channelId}`;
        const channelResponse = await fetch(channelInfoUrl, options);
        const channelData = await channelResponse.json();
        const channel = channelData.ok ? channelData.channel : null;

        // 5. Process messages and fetch user details
        const messages = await Promise.all(
            filteredMessages.map(async (message) => {
                // Fetch user details
                const userInfoUrl = `https://slack.com/api/users.info?user=${message.user}`;
                const userResponse = await fetch(userInfoUrl, options);
                const userData = await userResponse.json();
                const user = userData.ok ? userData.user : null;

                return {
                    user: {
                        id: user?.id || 'N/A',
                        name: user?.name || 'N/A',
                        real_name: user?.real_name || 'N/A',
                        profile: {
                            image_small: user?.profile?.image_24 || 'N/A',
                            image_medium: user?.profile?.image_72 || 'N/A',
                            image_large: user?.profile?.image_1024 || 'N/A'
                        },
                        is_bot: user?.is_bot || false
                    },
                    ts: message.ts,
                    text: message.text,
                    channel: {
                        id: channel?.id || 'N/A',
                        name: channel?.name || 'N/A'
                    },
                    permalink: `https://${team?.domain}.slack.com/archives/${channelId}/p${message.ts.replace('.', '')}`,
                    ts_time: new Date(parseFloat(message.ts) * 1000).toISOString()
                };
            })
        );

        return res.status(200).json({ success: true, messages });

    } catch (err) {
        console.error('Error fetching messages:', err);
        return res.status(500).json({ success: false, message: 'Error fetching messages', error: err.message });
    }
};



module.exports = {
    testConnection,
    populateConversationStore,
    fetchConversationHistory,
    fetchQueryMatchMessages,
    getAllUsersFromSlackChannel,
    getLatestFilesCreatedByUser,
    getAllUsersFromWorkspace,
    getMentionsFromAllChannels,
    getRecentChannels,
    getLatestMessagesFromPrivateChannel,
    sendDirectMessage,
    getLatestMessagesWithHashtags
}
