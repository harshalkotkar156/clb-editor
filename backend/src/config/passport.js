import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    const avatar = profile.photos?.[0]?.value || '';
    const name = profile.displayName || email?.split('@')[0] || 'User';

    if (!email) {
      return done(new Error('Google account has no associated email address'), null);
    }

    // check if user already exists by googleId or email
    let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

    if (user) {
      // update googleId or avatar if missing
      let modified = false;
      if (!user.googleId) {
        user.googleId = profile.id;
        modified = true;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        modified = true;
      }
      if (modified) await user.save();
      return done(null, user);
    }

    // new user — create them
    user = await User.create({
      googleId: profile.id,
      name,
      email,
      avatar
    });

    return done(null, user);

  } catch (err) {
    return done(err, null);
  }
}));

export default passport;