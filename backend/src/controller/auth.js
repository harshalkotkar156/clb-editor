import passport from 'passport';
import jwt from 'jsonwebtoken';
import '../config/passport.js'; // registers Google strategy


// 🔹 1. Redirect user to Google login page
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
});


// 🔹 2. Handle Google callback + generate JWT + redirect to frontend
export const googleAuthCallback = [
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/?error=oauth_failed`
  }),
  (req, res) => {
    // req.user comes from passport (Google strategy)

    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // redirect user to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
  }
];


// 🔹 3. Get current logged-in user (verify JWT)
export const getCurrentUser = (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ user: decoded });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};


// 🔹 4. Logout (client-side token removal)
export const logoutUser = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};