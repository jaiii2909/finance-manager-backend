const { ROLES } = require("../models/User");

/**
 * Role hierarchy: viewer < analyst < admin
 * requireRole("analyst") means analyst OR admin can access.
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    const userRoleIndex = ROLES.indexOf(req.user.role);
    const minRequiredIndex = Math.min(...allowedRoles.map((r) => ROLES.indexOf(r)));

    if (userRoleIndex < minRequiredIndex) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};

// Convenience guards
const viewerOrAbove  = requireRole("viewer");
const analystOrAbove = requireRole("analyst");
const adminOnly      = requireRole("admin");

module.exports = { requireRole, viewerOrAbove, analystOrAbove, adminOnly };
