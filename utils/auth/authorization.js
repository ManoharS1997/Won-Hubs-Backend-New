
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    // console.log("auth headers: ", req.headers.authorization);
    if (!authHeader) {
      // console.error("Authentication Error: No Authorization header provided");
      return res.status(401).json({ message: 'Access Denied: No Authorization header provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      // console.error("Authentication Error: Token not found in Authorization header");
      return res.status(401).json({ message: 'Access Denied: Token missing' });
    }
    // console.log("Token received for verification:", token);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        console.error("JWT Verification Error:", err);

        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token expired, please login again' });
        }

        if (err.name === 'JsonWebTokenError') {
          return res.status(403).json({ message: 'Invalid token, access denied' });
        }

        return res.status(403).json({ message: 'Authentication failed' });
      }

      req.user = user;
      next();
    });

  } catch (error) {
    console.error("Unexpected Error in Authentication Middleware:", error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = authenticateToken;