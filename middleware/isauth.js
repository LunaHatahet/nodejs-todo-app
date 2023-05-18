const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers.authorization?.split(" ")[1];

  console.log(token);

  console.log(JWT_SECRET);

  if (!token) {
    return res.status(401).send("Missing token");
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send("Unauthorized");
    }
    req.user = { id: decoded.userId };
    next();
  });
};
