
// require('dotenv').config();
// const { db } = require("../../config/DB-connection");


// ✅ Middleware to Protect Routes
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer Token
    if (!token) return res.status(401).json({ message: "Access denied" });

    jwt.verify(token, ACCESS_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token expired or invalid" });

        req.user = user; // Attach user info to request
        next();
    });
};

// ✅ Refresh Token Route
const refreshToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

    if (!refreshTokens.includes(refreshToken)) return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token expired or invalid" });

        const newAccessToken = jwt.sign({ id: user.id, username: user.username }, ACCESS_SECRET, { expiresIn: "15m" });

        res.json({ accessToken: newAccessToken });
    });
}

// ✅ Logout Route (Clears Refresh Token)
const logout = (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
}

module.exports = {
    authenticateToken, 
    logout,
    refreshToken
}