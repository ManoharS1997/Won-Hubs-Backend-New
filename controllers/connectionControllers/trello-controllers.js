require('dotenv').config();
const { db } = require("../../config/DB-connection");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

// api to get toeken and secret from db of the user
const getApiTokenByUserId = async (ID) => {
    try {
        const query = `SELECT api_token, connection_secret FROM wonhubs.connections WHERE creator = ? AND app_name="Trello"`
        const [result] = await db.query(query, [ID]);
        return result[0]
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// api to get the organization id of the user
// This function fetches the organization ID of a Trello user using their API token and connection secret.
const getOrganizationId = async (api_token, connection_secret) => {
    try {
        const response = await axios.get("https://api.trello.com/1/members/me/organizations", {
            params: {
                key: api_token,
                token: connection_secret,
            },
        });
        const data = response.data;
        // console.log('trello organizations: ',data);

        const organizationId = data[0].id;
        return organizationId;
    } catch (err) {
        console.error("error in getOrganizationId", err);
        return null
    }
}

// api to get all the boards of the organization
// This function fetches all boards of a Trello organization using the organization's ID, API token, and connection secret.
const getOrganisationBoards = async (req, res) => {
    const { userId } = req.body;

    try {
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);
        const organizationId = await getOrganizationId(api_token, connection_secret);

        const url = `https://api.trello.com/1/organizations/${organizationId}/boards?key=${api_token}&token=${connection_secret}`;
        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };

        const response = await fetch(url, options);

        if (response.ok) {
            const data = await response.json();
            return res.status(200).json({ success: true, data });
        }

        // Handle specific errors
        if (response.status === 429) {
            return res.status(429).json({
                success: false,
                message: "Rate limit exceeded. Please try again later."
            });
        }

        const errorData = await response.json();
        console.error("Trello API Error:", errorData);
        return res.status(response.status).json({
            success: false,
            message: errorData.message || "Failed to fetch organization boards"
        });

    } catch (err) {
        console.error("Error getting organization boards:", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching organization boards"
        });
    }
};

// This function checks if the due date of a Trello card has been exceeded based on a specified duration and time unit.
// It takes a due date string, a duration value, and a time unit (minutes, hours, days, weeks) as input.
function isDueDateExceeded(dueDateStr, value, unit) {
    // Parse the due date string into a Date object
    const dueDate = new Date(dueDateStr);

    // Get the current date
    const currentDate = new Date();

    // Convert value to a number (in case it's a string)
    const durationValue = Number(value);

    // Check if the value is a valid number
    if (isNaN(durationValue) || durationValue <= 0) {
        throw new Error("Invalid duration value");
    }

    // Define a mapping for units to milliseconds
    const unitToMilliseconds = {
        minutes: 1000 * 60,
        hours: 1000 * 60 * 60,
        days: 1000 * 60 * 60 * 24,
        weeks: 1000 * 60 * 60 * 24 * 7
    };

    // Check if the unit is valid
    if (!unitToMilliseconds[unit]) {
        throw new Error("Invalid time unit. Valid units are: minutes, hours, days, weeks.");
        // return "Invalid time unit. Valid units are: minutes, hours, days, weeks."
    }

    // Calculate the duration in milliseconds
    const durationInMilliseconds = durationValue * unitToMilliseconds[unit];

    // Calculate the difference between due date and current date
    const differenceInMilliseconds = dueDate - currentDate;
    // console.log('difference between:', differenceInMilliseconds < durationInMilliseconds);

    // Compare the difference with the specified duration
    return differenceInMilliseconds < durationInMilliseconds;
}

// this function fetches all the Lists of the Board using the board ID and API token
// It returns the list of lists in the board.
const getTrelloBoardLists = async (req, res, next) => {
    const { BOARD_ID } = req.params
    const { userId } = req.body
    try {
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        const response = await axios.get(`https://api.trello.com/1/boards/${BOARD_ID}/lists`, {
            params: {
                key: api_token,
                token: connection_secret,
            },
        });
        const boardLists = response.data.map(list => ({ name: list.name, id: list.id }))
        // console.log('boardsList', boardLists);
        return res.status(200).json({ data: boardLists, success: true });
    } catch (err) {
        console.log("error getting trello board list", err);

    }
}

// This function fetches all cards from a specified Trello list or board using the list ID or board ID and API token.
// It returns the list of cards in the specified list or board.
const getTrelloListCards = async (req, res, next) => {
    const { type, ID } = req.params;
    const { userId } = req.body;

    try {
        // Get API token and secret for the user
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);
        let url = `https://api.trello.com/1/`
        if (type === 'list') {
            url = url + `lists/${ID}/cards`
        }
        if (type === 'board') {
            url = url + `boards/${ID}/cards`
        }
        // console.log("trello url:", url);

        // Fetch cards from the specified list
        const response = await axios.get(url, {
            params: {
                key: api_token,
                token: connection_secret,
            },
        });

        // Extract relevant card details
        const listCards = response.data.map(card => ({
            id: card.id,
            name: card.name
        }));

        // console.log('List Cards:', listCards);
        return res.status(200).json({ data: listCards, success: true });
    } catch (err) {
        // console.error("Error fetching Trello list cards", err);
        return res.status(500).json({ message: "Failed to fetch cards", success: false });
    }
};

// this function fetches all the organizations of the user using the API token and secret from the database
// It returns the list of organizations in the user's account.
const getTrelloOrganizations = async (req, res) => {
    const { userId } = req.body;

    try {
        // Fetch API key & token from DB
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        // Trello API request
        const response = await axios.get(`https://api.trello.com/1/members/me/organizations`, {
            params: {
                key: api_token,
                token: connection_secret
            }
        });

        const organizations = response.data.map(org => ({
            id: org.id,
            name: org.displayName
        }));

        return res.status(200).json({ success: true, data: organizations });
    } catch (err) {
        console.error("Error fetching Trello organizations:", err.message);
        return res.status(500).json({ success: false, message: "Failed to fetch organizations." });
    }
};

// this function fetches all the members of the board using the board ID and API token and secret from the database
// It returns the list of members in the board.
const getBoardMembers = async (req, res) => {
    const { userId } = req.body;  // Get board ID & user ID from request
    const { boardId } = req.params; // Extract boardId from request parameters

    try {
        // Fetch API key & token from DB
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        // Ensure boardId is provided
        if (!boardId) {
            return res.status(400).json({ success: false, message: "Board ID is required." });
        }

        // Trello API call to get members of the board
        const response = await axios.get(`https://api.trello.com/1/boards/${boardId}/members`, {
            params: {
                key: api_token,
                token: connection_secret
            }
        });

        // Extract relevant member details
        const boardMembers = response.data.map(member => ({
            id: member.id,
            name: member.fullName,
            username: member.username
        }
        ));

        return res.status(200).json({ success: true, data: boardMembers });

    } catch (err) {
        console.error("Error fetching Trello board members:", err.message);
        return res.status(500).json({ success: false, message: "Failed to fetch board members." });
    }
};

const getOrganizationMembers = async (req, res) => {
    const { userId } = req.body;

    try {
        // First fetch API credentials
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        // Now get the organization ID using those credentials
        const orgId = await getOrganizationId(api_token, connection_secret);

        if (!orgId) {
            return res.status(400).json({ success: false, message: "Organization ID is required." });
        }

        // Trello API to get members of the organization
        const response = await axios.get(`https://api.trello.com/1/organizations/${orgId}/members`, {
            params: {
                key: api_token,
                token: connection_secret
            }
        });

        // Extract relevant member details
        const organizationMembers = response.data.map(member => ({
            id: member.id,
            name: member.fullName,
            username: member.username,
            email: member.email || null
        }));
        // console.log('organizationMembers', organizationMembers);

        return res.status(200).json({ success: true, data: organizationMembers });

    } catch (err) {
        console.error("Error fetching Trello organization members:", err.message);
        return res.status(500).json({ success: false, message: "Failed to fetch organization members." });
    }
};

const getBoardLabels = async (req, res) => {
    const { userId } = req.body;  // Get user ID from request body
    const { boardId } = req.params; // Get board ID from request params

    try {
        // Fetch API token & secret from DB using user ID
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        // Ensure boardId is provided
        if (!boardId) {
            return res.status(400).json({ success: false, message: "Board ID is required." });
        }

        // Trello API request to get labels
        const response = await axios.get(`https://api.trello.com/1/boards/${boardId}/labels`, {
            params: {
                key: api_token,
                token: connection_secret
            }
        });

        // Extract relevant label details
        const boardLabels = response.data.map(label => ({
            id: label.id,
            name: (label.color[0]).toUpperCase() + label.color.slice(1) || "Unnamed Label",  // Handle cases where name might be empty
            color: label.color
        }));

        return res.status(200).json({ success: true, data: boardLabels });

    } catch (err) {
        console.error("Error fetching Trello board labels:", err);
        return res.status(500).json({ success: false, message: "Failed to fetch board labels." });
    }
};

const getCardAttachments = async (req, res) => {
    const { userId } = req.body;  // Extract userId from request body
    const { cardId } = req.params; // Extract cardId from request parameters

    try {
        // Fetch API key & token from DB
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        // Ensure cardId is provided
        if (!cardId) {
            return res.status(400).json({ success: false, message: "Card ID is required." });
        }

        // Trello API call to get attachments of the card
        const response = await axios.get(`https://api.trello.com/1/cards/${cardId}/attachments`, {
            params: {
                key: api_token,
                token: connection_secret
            }
        });

        // Extract relevant attachment details
        const attachments = response.data.map(attachment => ({
            id: attachment.id,
            name: attachment.name,
        }));

        return res.status(200).json({ success: true, data: attachments });

    } catch (err) {
        console.error("Error fetching Trello card attachments:", err.message);
        return res.status(500).json({ success: false, message: "Failed to fetch card attachments." });
    }
};

// ---------------------------------------------------------------
// Test Trello Connection
// ---------------------------------------------------------------
const testTrelloConnection = async (req, res) => {
    const { api_key, oauth_token } = req.body
    try {
        const response = await axios.get("https://api.trello.com/1/members/me", {
            params: {
                key: api_key,
                token: oauth_token,
            },
        });

        res.status(200).json({
            success: true,
            message: "Trello API Connection Successful",
            data: response.data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to connect to Trello API",
            error: error.response ? error.response.data : error.message,
        });
    }
};

const getDueCards = async (req, res, next) => {
    const { BOARD_ID, TIME, TIME_UNIT, status, isMember, userId } = req.body;
    try {
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);
        const response = await fetch(`https://api.trello.com/1/boards/${BOARD_ID}/cards?key=${api_token}&token=${connection_secret}`, { method: 'GET' });
        const data = await response.json();
        const adminResponse = await axios.get("https://api.trello.com/1/members/me", {
            params: {
                key: api_token,
                token: connection_secret,
            },
        });
        // Filter by due date
        let dueCards = data.filter(card => {
            const cardStatus = status === 'incomplete' ? card.closed === false ? false : true : true;

            if (isMember === true) {
                const isMemberIncluded = card.idMembers.includes(adminResponse.data.id);
                // console.log('isMemberIncluded', isMemberIncluded);
                return card.due && isDueDateExceeded(card.due, TIME, TIME_UNIT) && isMemberIncluded && cardStatus
            }
            return card.due && isDueDateExceeded(card.due, TIME, TIME_UNIT) && cardStatus
        });

        // console.log(dueCards);
        // console.log('dueCards', dueCards);
        return res.status(200).json({ success: true, data: dueCards });
    } catch (error) {
        console.error("Error fetching cards:", error.response?.data || error.message);
    }
};

const checkCardMovement = async (req, res) => {
    const { userId, CARD_ID } = req.body; // User ID and optional Card ID

    try {
        // Fetch user's API key & token
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        let movements = [];

        if (CARD_ID) {
            // Case 1: Card ID is provided → Fetch history for that card
            const response = await axios.get(`https://api.trello.com/1/cards/${CARD_ID}/actions`, {
                params: {
                    key: api_token,
                    token: connection_secret,
                    filter: "updateCard"
                }
            });

            // Filter actions where the card was moved
            movements = response.data.filter(action => action.data.listBefore && action.data.listAfter);
        } else {
            // Case 2: No Card ID → Get recent activity from all cards on the user's boards

            // Step 1: Fetch all boards of the user
            const boardsResponse = await axios.get(`https://api.trello.com/1/members/me/boards`, {
                params: {
                    key: api_token,
                    token: connection_secret,
                    fields: "id"
                }
            });

            const boardIds = boardsResponse.data.map(board => board.id);
            let allMovements = [];

            // Step 2: Fetch recent activity from all boards
            for (const boardId of boardIds) {
                const actionsResponse = await axios.get(`https://api.trello.com/1/boards/${boardId}/actions`, {
                    params: {
                        key: api_token,
                        token: connection_secret,
                        filter: "updateCard",
                        limit: 10 // Fetch last 10 actions
                    }
                });

                // Filter for list movements
                const boardMovements = actionsResponse.data.filter(action => action.data.listBefore && action.data.listAfter);
                allMovements = allMovements.concat(boardMovements);
            }

            // Sort movements by date (most recent first)
            allMovements.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Get the latest 2 movements
            movements = allMovements.slice(0, 2);
        }

        if (movements.length > 0) {
            return res.status(200).json({ success: true, data: movements });
        } else {
            return res.status(200).json({ success: false, message: "No recent list movements found." });
        }
    } catch (err) {
        console.error("Error checking card movement:", err);
        return res.status(500).json({ success: false, message: "Failed to check card movement" });
    }
};

const getUpdatedCards = async (req, res) => {
    const { userId, BOARD_ID, CARD_ID } = req.body;

    try {
        // Fetch user's API key & token
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        let url;
        if (CARD_ID) {
            // If cardId is provided, fetch updates for that specific card
            url = `https://api.trello.com/1/cards/${CARD_ID}/actions`;
        } else {
            // If no cardId, fetch updates for the entire board
            url = `https://api.trello.com/1/boards/${BOARD_ID}/actions`;
        }

        // Fetch updated card actions
        const response = await axios.get(url, {
            params: {
                key: api_token,
                token: connection_secret,
                filter: "updateCard",
                limit: 10 // Get the last 10 updates
            }
        });

        return res.status(200).json({ success: true, data: response.data });
    } catch (err) {
        console.error("Error fetching updated cards:", err);
        return res.status(500).json({ success: false, message: "Failed to fetch updated cards" });
    }
};

const testTrelloTrigger = async (req, res) => {
    const { userId, activity, BOARD_ID, LIST_ID, CARD_ID } = req.body;

    try {
        // Fetch API Key & Token for Trello access
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        // Fetch all board activities from Trello API
        const response = await axios.get(`https://api.trello.com/1/boards/${BOARD_ID}/actions`, {
            params: {
                key: api_token,
                token: connection_secret,
                filter: activity !== "all" ? activity : "all", // Filter by activity type if provided
            },
        });

        let activities = response.data;
        // console.log('trello activities: ', activity, activities);


        // Filter activities based on listId or cardId if provided
        if (CARD_ID) {
            activities = activities.filter(action => action.data.card && action.data.card.id === CARD_ID);
        } else if (LIST_ID) {
            activities = activities.filter(action => action.data.list && action.data.list.id === LIST_ID);
        }

        // Get the latest 2 activities (if available)
        const latestActivities = activities.slice(0, 2);

        if (latestActivities.length > 0) {
            return res.status(200).json({ success: true, data: latestActivities });
        } else {
            return res.status(200).json({ success: false, message: "No recent matching activities found." });
        }
    } catch (err) {
        console.error("Error fetching Trello activities:", err.message);
        return res.status(500).json({ success: false, message: "Failed to fetch Trello activities." });
    }
};

const findMemberInOrganization = async (req, res) => {
    const { userId, organizationId, memberName, ifNoResults } = req.body;

    try {
        // Fetch API key & token from DB
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        // Get all members of the organization
        const response = await axios.get(`https://api.trello.com/1/organizations/${organizationId}/members`, {
            params: {
                key: api_token,
                token: connection_secret
            }
        });

        // Filter members based on the provided `memberName`
        const matchingMembers = response.data.filter(member =>
            member.fullName.toLowerCase().includes(memberName.toLowerCase()) ||
            member.username.toLowerCase().includes(memberName.toLowerCase())
        );

        // If members are found, return success with member details
        if (matchingMembers.length > 0) {
            return res.status(200).json({ success: true, data: matchingMembers });
        }

        // If no results found, handle based on `ifNoResults` input
        if (ifNoResults === "true") {
            return res.status(200).json({ success: true, message: "No matching members found, but marked as successful." });
        } else {
            return res.status(200).json({ success: false, message: "No matching members found, safely halted." });
        }

    } catch (err) {
        console.error("Error finding member in Trello organization:", err.message);
        return res.status(500).json({ success: false, message: "Failed to fetch organization members." });
    }
};

const addAttachmentonCard = async (req, res) => {
    const { userId, boardId, listId, cardId, fileAttachment, urlAttachment } = req.body;

    try {
        // Fetch API key & token from DB
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        // Ensure cardId is provided
        if (!cardId) {
            return res.status(400).json({ success: false, message: "Card ID is required." });
        }

        let attachmentResponse = null;

        // If a file is provided, upload it
        if (fileAttachment) {
            const formData = new FormData();
            formData.append("key", api_token);
            formData.append("token", connection_secret);
            formData.append("file", fs.createReadStream(fileAttachment));

            attachmentResponse = await axios.post(
                `https://api.trello.com/1/cards/${cardId}/attachments`,
                formData,
                { headers: formData.getHeaders() }
            );
        }

        // If a URL is provided, attach it
        if (urlAttachment) {
            attachmentResponse = await axios.post(
                `https://api.trello.com/1/cards/${cardId}/attachments`,
                null,
                {
                    params: {
                        key: api_token,
                        token: connection_secret,
                        url: urlAttachment
                    }
                }
            );
        }

        if (attachmentResponse) {
            return res.status(200).json({ success: true, data: [attachmentResponse.data] });
        } else {
            return res.status(200).json({ success: false, message: "No attachment provided." });
        }

    } catch (err) {
        console.error("Error adding attachment to Trello card:", err.message);
        return res.status(500).json({ success: false, data: [{ message: "Failed to add attachment." }] });
    }
};

const addMemberToBoard = async (req, res) => {
    const { userId, boardId, memberId, membershipType, allowBillableGuest } = req.body;

    try {
        // Fetch API key & token from DB
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        // Ensure required fields are provided
        if (!boardId || !memberId || !membershipType) {
            return res.status(400).json({ success: false, data: [{ message: "Board ID, Member ID, and Membership Type are required." }] });
        }

        // Trello API call to add member to board
        const response = await axios.put(
            `https://api.trello.com/1/boards/${boardId}/members/${memberId}`,
            null, // No request body, only query params
            {
                params: {
                    key: api_token,
                    token: connection_secret,
                    type: membershipType, // 'admin', 'normal', or 'observer'
                    allowBillableGuest: allowBillableGuest || false // Default to false if not provided
                }
            }
        );

        return res.status(200).json({ success: true, message: "Member added successfully", data: [response.data] });

    } catch (err) {
        console.error("Error adding member to Trello board:", err.message);
        return res.status(500).json({ success: false, data: [{ message: "Failed to add member to board." }] });
    }
};

const addMembersToCard = async (req, res) => {
    const { userId, boardId, listId, cardId, memberIds } = req.body;
    // console.log(memberIds, 'memberIds');

    try {
        // Fetch API key & token from DB
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        // Validate required inputs
        if (!boardId || !listId || !cardId || !memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
            return res.status(400).json({ success: false, message: "Board ID, List ID, Card ID, and at least one Member ID are required." });
        }

        let addedMembers = [];

        // Loop through each memberId and add them to the card
        for (const memberId of memberIds) {
            const response = await axios.post(
                `https://api.trello.com/1/cards/${cardId}/idMembers`,
                null, // No request body, only query params
                {
                    params: {
                        key: api_token,
                        token: connection_secret,
                        value: memberId
                    }
                }
            );
            addedMembers.push(response.data);
        }

        return res.status(200).json({
            success: true,
            message: "Members added to the card successfully",
            data: addedMembers
        });

    } catch (err) {
        console.error("Error adding members to Trello card:", err.message);
        return res.status(500).json({ success: false, message: "Failed to add members to card." });
    }
};

const closeTrelloBoard = async (req, res) => {
    const { userId, boardId } = req.body;

    try {
        // Fetch API key & token from DB
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        // Validate required input
        if (!boardId) {
            return res.status(400).json({ success: false, message: "Board ID is required." });
        }

        // Trello API call to close the board
        const response = await axios.put(
            `https://api.trello.com/1/boards/${boardId}`,
            null, // No request body, only query params
            {
                params: {
                    key: api_token,
                    token: connection_secret,
                    closed: true
                }
            }
        );

        return res.status(200).json({ success: true, message: "Board closed successfully", data: [response.data] });

    } catch (err) {
        console.error("Error closing Trello board:", err.message);
        return res.status(500).json({ success: false, message: "Failed to close board." });
    }
};

const createTrelloBoard = async (req, res) => {
    const { userId, organization_id, name, description, permission_level, allow_team_members } = req.body;

    try {
        // Fetch API key & token from DB
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        // Validate required inputs
        if (!organization_id || !name || !permission_level) {
            return res.status(400).json({ success: false, message: "Organization ID, Board Name, and Permission Level are required." });
        }

        // Trello API call to create the board
        const response = await axios.post(
            `https://api.trello.com/1/boards/`,
            null, // No request body, only query params
            {
                params: {
                    key: api_token,
                    token: connection_secret,
                    name: name,
                    desc: description || "", // Default empty string if not provided
                    idOrganization: organization_id,
                    prefs_permissionLevel: permission_level,
                    prefs_selfJoin: allow_team_members || false // Default to false if not provided
                }
            }
        );

        return res.status(201).json({
            success: true,
            message: "Board created successfully",
            data: [response.data]
        });

    } catch (err) {
        console.error("Error creating Trello board:", err.message);
        return res.status(500).json({ success: false, message: "Failed to create board." });
    }
};

const createTrelloCard = async (req, res) => {
    try {
        const {
            Board, List, Name, Description, Label, CustomLabel, CardPosition,
            Member, StartDate, DueDate, FileAttachments,
            URLAttachments, ChecklistName, ChecklistItems, userId,
            CardColor, Brghtness, URL, Size, Coordinates, Address, Location
        } = req.body;

        // Validate required fields
        if (!Board || !List || !Name) {
            return res.status(400).json({ success: false, message: "Board, List, and Name are required." });
        }

        // Fetch API credentials (replace with your method to retrieve API token)
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        // Create card payload
        const payload = {
            idList: List,
            name: Name,
            desc: Description || "",
            pos: CardPosition || "bottom",
            idLabels: Label !== "none" ? [Label] : [],
            idMembers: Member ? [Member] : [],
            due: DueDate || null,
            start: StartDate || null,
            urlSource: URL || null,
        };
        // console.log('payload', payload);

        // Create card in Trello
        const cardResponse = await axios.post(`https://api.trello.com/1/cards`, null, {
            params: {
                ...payload,
                key: api_token,
                token: connection_secret,
            }
        });

        const cardId = cardResponse.data.id;

        // Add attachments (if provided)
        if (FileAttachments) {
            await axios.post(`https://api.trello.com/1/cards/${cardId}/attachments`, null, {
                params: {
                    key: api_token,
                    token: connection_secret,
                    file: FileAttachments.value, // Ensure this is a valid file path
                }
            });
        }

        if (URLAttachments) {
            await axios.post(`https://api.trello.com/1/cards/${cardId}/attachments`, null, {
                params: {
                    key: api_token,
                    token: connection_secret,
                    url: URLAttachments,
                }
            });
        }

        // Add checklist (if provided)
        if (ChecklistName) {
            const checklistResponse = await axios.post(`https://api.trello.com/1/cards/${cardId}/checklists`, null, {
                params: {
                    key: api_token,
                    token: connection_secret,
                    name: ChecklistName,
                }
            });

            const checklistId = checklistResponse.data.id;

            // Add checklist items
            if (ChecklistItems?.checklistItems?.length > 0) {
                await Promise.all(
                    ChecklistItems.checklistItems.map(item =>
                        axios.post(`https://api.trello.com/1/checklists/${checklistId}/checkItems`, null, {
                            params: {
                                key: api_token,
                                token: connection_secret,
                                name: item,
                            }
                        })
                    )
                );
            }
        }

        // Send success response
        return res.status(200).json({ success: true, message: "Card created successfully", cardId });

    } catch (error) {
        console.error("Error creating Trello card:", error);
        return res.status(500).json({ success: false, message: "Failed to create Trello card" });
    }
};

const addCommentToCard = async (req, res) => {
    const { userId, boardId, listId, cardId, commentText } = req.body;

    try {
        // Fetch API key & token from DB
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        // Validate required inputs
        if (!boardId || !listId || !cardId || !commentText) {
            return res.status(400).json({ success: false, message: "Board ID, List ID, Card ID, and Comment Text are required." });
        }

        // Send request to Trello API to add comment
        const response = await axios.post(
            `https://api.trello.com/1/cards/${cardId}/actions/comments`,
            { text: commentText },
            {
                params: {
                    key: api_token,
                    token: connection_secret
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: "Comment added to the card successfully",
            data: [response.data]
        });

    } catch (err) {
        console.error("Error adding comment to Trello card:", err.message);
        return res.status(500).json({ success: false, message: "Failed to add comment to card." });
    }
};

const createListInBoard = async (req, res) => {
    const { userId, boardId, name } = req.body;

    try {
        // Fetch API key & token from DB
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        // Validate required inputs
        if (!boardId || !name) {
            return res.status(400).json({ success: false, message: "Board ID and List Name are required." });
        }

        // Send request to Trello API to create a list
        const response = await axios.post(
            `https://api.trello.com/1/boards/${boardId}/lists`,
            null,
            {
                params: {
                    key: api_token,
                    token: connection_secret,
                    name: name
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: "List created successfully",
            data: [response.data]
        });

    } catch (err) {
        console.error("Error creating list in Trello board:", err.message);
        return res.status(500).json({ success: false, message: "Failed to create list." });
    }
};

const moveCardToList = async (req, res) => {
    const { userId, boardId, fromListId, cardId, toBoardId, toListId } = req.body;

    try {
        // Fetch API key & token from DB
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        // Validate required inputs
        if (!boardId || !fromListId || !cardId || !toBoardId || !toListId) {
            return res.status(400).json({ success: false, message: "Board ID, From List ID, Card ID, To Board ID, and To List ID are required." });
        }

        // Move card to the new list (and optionally to another board)
        const response = await axios.put(
            `https://api.trello.com/1/cards/${cardId}`,
            null,
            {
                params: {
                    key: api_token,
                    token: connection_secret,
                    idList: toListId, // Move to new list
                    ...(boardId !== toBoardId && { idBoard: toBoardId }) // Move to new board if different
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: "Card moved successfully",
            data: [response.data]
        });

    } catch (err) {
        console.error("Error moving card in Trello:", err);
        return res.status(500).json({ success: false, message: "Failed to move card.", });
    }
};

const updateTrelloCard = async (req, res) => {
    try {
        const {
            userId, Board, List, Card, cardName, cardDescription,
            overwriteDescription, cardStartDate, cardDueDate, dueComplete,
            cardColor, Brghtness, attachmentId, URL, Size, Coordinates,
            Address, Location
        } = req.body;
        // console.log('card update payload', !userId, !Board, !List, !Card, (!cardName && cardName !== ""));

        // Validate required fields
        if (!userId || !Board || !List || !Card || (!cardName && cardName !== "")) {
            return res.status(400).json({ success: false, message: "User ID, Board, List, Card, and Card Name are required." });
        }

        // Fetch API credentials
        const { api_token, connection_secret } = await getApiTokenByUserId(userId);

        // Build the update payload
        const payload = {
            idList: List,
            name: cardName,
            pos: "bottom", // Default position
            start: cardStartDate || null,
            due: cardDueDate || null,
            dueComplete: dueComplete || false,
            cover: {
                color: cardColor || null,
                brightness: Brghtness || null,
            },
            address: Address || null,
            locationName: Location || null,
            coordinates: Coordinates || null,
            urlSource: URL || null,
        };

        // Handle description update
        if (overwriteDescription) {
            payload.desc = cardDescription || "";
        }

        // Update the Trello card
        const updateResponse = await axios.put(`https://api.trello.com/1/cards/${Card}`, null, {
            params: {
                ...payload,
                key: api_token,
                token: connection_secret,
            }
        });

        // Handle attachments
        if (attachmentId) {
            await axios.post(`https://api.trello.com/1/cards/${Card}/attachments`, null, {
                params: {
                    key: api_token,
                    token: connection_secret,
                    file: attachmentId, // Ensure this is a valid file path or Trello attachment ID
                }
            });
        }

        return res.status(200).json({ success: true, message: "Card updated successfully", data: [updateResponse.data] });

    } catch (error) {
        console.error("Error updating Trello card:", error);
        return res.status(500).json({ success: false, message: "Failed to update Trello card" });
    }
};


module.exports = {
    testTrelloConnection, getOrganisationBoards, getDueCards, getTrelloBoardLists,
    getTrelloListCards, checkCardMovement, getUpdatedCards, testTrelloTrigger,
    addAttachmentonCard, getTrelloOrganizations, findMemberInOrganization, getBoardMembers,
    getBoardLabels, addMemberToBoard, addMembersToCard, closeTrelloBoard,
    createTrelloBoard, createTrelloCard, addCommentToCard, createListInBoard,
    moveCardToList, updateTrelloCard, getCardAttachments, getOrganizationMembers
};