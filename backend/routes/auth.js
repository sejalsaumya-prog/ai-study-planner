const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
// Test route - remove after debugging
router.get('/test', async (req, res) => {
  try {
    const User = require('../models/User');
    const count = await User.countDocuments();
    res.json({ message: 'DB working', userCount: count });
  } catch (error) {
    res.json({ message: 'DB failed', error: error.message });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, studyHoursPerDay } = req.body;

    console.log('Register attempt:', email);

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password manually
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with pre-hashed password
    const user = new User({
      name,
      email,
      password: hashedPassword,
      studyHoursPerDay
    });

    // Skip the pre-save hook by saving directly
    await User.collection.insertOne({
      name,
      email,
      password: hashedPassword,
      studyHoursPerDay: studyHoursPerDay || 4,
      createdAt: new Date()
    });

    // Generate token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Register success:', email);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name,
        email,
        studyHoursPerDay: studyHoursPerDay || 4
      }
    });
  } catch (error) {
    console.error('Register error full:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studyHoursPerDay: user.studyHoursPerDay
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, studyHoursPerDay } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, studyHoursPerDay },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
