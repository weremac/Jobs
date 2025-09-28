const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token nije priložen' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const teacher = await Teacher.findById(decoded.id).select('-password');
    
    if (!teacher) {
      return res.status(401).json({ message: 'Token nije validan' });
    }

    req.teacher = teacher;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token nije validan' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.teacher.role !== 'admin' && req.teacher.role !== 'principal') {
        return res.status(403).json({ message: 'Nedovoljne dozvole' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Nedovoljne dozvole' });
  }
};

module.exports = { auth, adminAuth };