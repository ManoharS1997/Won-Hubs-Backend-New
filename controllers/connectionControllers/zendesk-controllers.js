const axios = require('axios');

const getAllZendeskTickets = async (req, res, next) => {
    try {
        const url = req.body.url;

        const username = req.body.username;
        const password = req.body.password;

        const result = await axios.get(url, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
            },
        });

        return res.status(200).json({ success: true, data: result.data });
    } catch (err) {
        console.error("Error fetching Zendesk tickets:", err.message);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
};

module.exports = {
    getAllZendeskTickets
}