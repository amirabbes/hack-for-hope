const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Random 6-digit MFA code
    const authCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.authCode = authCode;
    user.authCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // In production, send via email. For testing, return in response.
    console.log(`Auth code for ${email}: ${authCode}`);
    res.json({ message: 'Authentication code sent', requiresCode: true, devCode: authCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyCode = async (req, res) => {
  try {
    const { email, authCode } = req.body;
    // Verify code
    const user = await User.findOne({ email });
    if (!user || user.authCode !== authCode) {
      return res.status(401).json({ message: 'Code invalide' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired code' });
    }

    // Clear code after verification
    user.authCode = undefined;
    user.authCodeExpires = undefined;
    await user.save();

    const token = generateToken(user);
    res.json({ token, role: user.role, email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Domain check (already enforced in model, but good to handle here for specific error msg)
    if (!email.endsWith('@sos-tunisie.org')) {
      return res.status(400).json({ message: 'Only @sos-tunisie.org emails are allowed' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { login, verifyCode, signup };