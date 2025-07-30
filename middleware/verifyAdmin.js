

export const verifyAdmin = (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    next();
  } catch (err) {
    res.status(500).json({ message: 'Access check failed' });
  }
};
