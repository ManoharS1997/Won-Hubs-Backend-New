const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || "my-access-secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "my-refresh-secret";

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

const generateAccessManagerToken = (employee) => {
  console.log(employee);
  return jwt.sign(
    { id: user.id, username: user.username },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user.id }, REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

const generateRefreshManagerToken = (employee) => {
  return jwt.sign(
    { employeeId: employee.id },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateAccessManagerToken,
  generateRefreshManagerToken,
};