const jwt = require("jsonwebtoken");
 
/**
 * Verifies Bearer JWT token and attaches decoded payload to req.user.
 * Decoded payload shape: { id, role, iat, exp }
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
 
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }
 
  const token = authHeader.split(" ")[1];
 
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role, iat, exp }
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Token expired, please log in again"
        : "Invalid token";
    return res.status(401).json({ message });
  }
};
 
/**
 * Restricts route to users whose role is in the allowed list.
 * Must be used AFTER authMiddleware.
 * Usage: router.delete("/...", authMiddleware, requireRole("admin"), handler)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ message: "Forbidden: insufficient permissions" });
  }
  next();
};
 
module.exports = { authMiddleware, requireRole };