const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @route  POST /api/auth/register
// @access Public
const register = async (req, res) => {
  try {
    const { name, mobile, password, role, preferredLanguage } = req.body;

    if (!name || !mobile || !password || !role) {
      return res.status(400).json({ message: 'Name, mobile, password and role are required' });
    }
    if (!['head', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either "head" or "member"' });
    }
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Mobile number must be exactly 10 digits' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ mobile });
    if (existing) {
      return res.status(409).json({ message: 'An account with this mobile number already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      mobile,
      password: hashedPassword,
      role,
      preferredLanguage: preferredLanguage === 'te' ? 'te' : 'en',
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        group: user.group,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// @route  POST /api/auth/login
// @access Public
const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ message: 'Mobile number and password are required' });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(401).json({ message: 'Invalid mobile number or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid mobile number or password' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        group: user.group,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  return res.status(200).json({ user: req.user });
};

// @route  PUT /api/auth/language
// @access Private
const updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    if (!['en', 'te'].includes(language)) {
      return res.status(400).json({ message: 'Language must be "en" or "te"' });
    }
    req.user.preferredLanguage = language;
    await req.user.save();
    return res.status(200).json({ message: 'Language updated', preferredLanguage: language });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error updating language' });
  }
};

// @route  POST /api/auth/forgot-password
// @access Public
// NOTE: For demo purposes this returns the reset token directly in the API
// response since no SMS/email provider is configured. In production, wire
// this up to an SMS gateway (mobile-based SHG users) or email service, and
// remove the token from the JSON response.
const forgotPassword = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      // Do not reveal whether the mobile number exists
      return res.status(200).json({
        message: 'If an account with that mobile number exists, a reset code has been generated',
      });
    }

    const resetToken = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-char OTP-style code
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // TODO: send resetToken via SMS/email in production instead of returning it.
    return res.status(200).json({
      message: 'Reset code generated. Valid for 15 minutes.',
      resetToken, // DEV ONLY - remove once an SMS/email provider is wired up
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// @route  POST /api/auth/reset-password
// @access Public
const resetPassword = async (req, res) => {
  try {
    const { mobile, resetToken, newPassword } = req.body;
    if (!mobile || !resetToken || !newPassword) {
      return res.status(400).json({ message: 'Mobile number, reset code and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(resetToken.toUpperCase()).digest('hex');

    const user = await User.findOne({
      mobile,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset code is invalid or has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({ message: 'Password has been reset successfully. Please log in.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error during password reset' });
  }
};

module.exports = { register, login, getMe, updateLanguage, forgotPassword, resetPassword };
