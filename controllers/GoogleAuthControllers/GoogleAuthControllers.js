const axios = require("axios");

const yahooAuth = (req, res) => {
    const clientId = process.env.YAHOO_CLIENT_ID;
    const redirectUri = process.env.YAHOO_REDIRECT_URI;

    console.log("👉 YAHOO CLIENT ID:", clientId);
    console.log("👉 RAW REDIRECT URI:", redirectUri);
    console.log("👉 ENCODED REDIRECT URI:", encodeURIComponent(redirectUri));

    const yahooAuthUrl =
        `https://api.login.yahoo.com/oauth2/request_auth?` +
        `client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code&scope=openid%20email`;

    console.log("👉 FINAL AUTH URL:", yahooAuthUrl);

    return res.redirect(yahooAuthUrl);
};


const yahooCallback = async (req, res) => {
    const { code } = req.query;

    try {
        const tokenResp = await axios.post(
            "https://api.login.yahoo.com/oauth2/get_token",
            new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: process.env.YAHOO_REDIRECT_URI,
                client_id: process.env.YAHOO_CLIENT_ID,
                client_secret: process.env.YAHOO_CLIENT_SECRET
            }).toString(),

            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        global.yahooTokens = tokenResp.data;   // access_token, refresh_token

        console.log("YAHOO TOKENS:", tokenResp.data);

        return res.redirect("http://localhost:5173/eventUpdate/?yahoo_auth=success");

    } catch (err) {
        console.log("Yahoo Auth Error:", err);
        return res.status(500).send("Yahoo login failed");
    }
}


module.exports = {
    yahooAuth,
    yahooCallback
};
