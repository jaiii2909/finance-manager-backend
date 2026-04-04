const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const register = async ({ name, email, password, role }) => {
  const user = await User.create({ name, email, password, role });
  const token = signToken(user._id);
  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }
  if (!user.isActive) {
    const err = new Error('Account is deactivated. Contact an admin.');
    err.statusCode = 403;
    throw err;
  }
  const token = signToken(user._id);
  return { user, token };
};

module.exports = { register, login };
