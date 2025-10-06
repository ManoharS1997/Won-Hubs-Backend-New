const jwt = require("jsonwebtoken");
const { db } = require("../../config/DB-connection")
const { generateAccessToken } = require("../auth/generateTokens");

const validate = async (req, res) => {
  console.log(' validating refreshToken: ', req.headers.authorization);
  const refreshToken = req.headers && req.headers?.authorization?.split(" ")[1];

  if (refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_SECRET
      );
      const [users] = await db.execute(`SELECT id, username FROM users WHERE id = ${decoded.userId}`);
      // console.log("user is verifying", users);
      const user = users[0]

      if (!user) {
        return res.status(401).json({ isLoggedIn: false });
      }
      const accessToken = generateAccessToken(user);
      return res.status(200).json({ isLoggedIn: true, accessToken });
    } catch (error) {
      return res.status(401).json({ isLoggedIn: false });
    }
  }

  return res.json({ isLoggedIn: false });
};


module.exports = {
  validate
};
