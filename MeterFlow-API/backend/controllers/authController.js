const AuthService = require('../services/AuthService');
const User = require('../models/User');

// Register
exports.register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    console.log('Registering user:', { email, name, role });
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await AuthService.register(email, password, name, role);
    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.log('Registration error:', error);
    res.status(400).json({ error: error.message, errorStack: error.stack });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await AuthService.login(email, password);
    res.json({
      message: 'Login successful',
      user: result.user.toJSON(),
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const tokens = await AuthService.refreshAccessToken(refreshToken);
    res.json({
      message: 'Token refreshed successfully',
      ...tokens
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, company, avatar, billingAddress } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          name,
          company,
          avatar,
          billingAddress,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords required' });
    }

    const user = await User.findById(req.userId).select('+password');
    const isValid = await user.comparePassword(currentPassword);

    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout (client-side action, but included for completeness)
exports.logout = async (req, res) => {
  try {
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
