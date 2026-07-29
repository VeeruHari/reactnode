export const adminOnly = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "Please login",
    });
  }

  if (req.session.role !== 0) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  next();
};