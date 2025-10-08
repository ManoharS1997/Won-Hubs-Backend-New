
const jwt = require("jsonwebtoken");

const decodeAccessToken = (header) => {
  try {
    const accessToken = header.split(" ")[1]; // Extract the token from the header
    if (!accessToken) {
      throw new Error("Access token is missing");
    }
    // Verify and decode the access token
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    // console.log("decoded value: ", decoded)
    return decoded; // Return the decoded payload
  } catch (error) {
    console.error("Error decoding access token:", error);
    throw new Error("Invalid access token");
  }
}

module.exports = decodeAccessToken