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
    // check if user already exists in DB
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      // existing user — just return them
      return done(null, user);
    }

    // new user — create them
    user = await User.create({
      googleId: profile.id,
      name:     profile.displayName,
      email:    profile.emails[0].value,
      avatar:   profile.photos[0].value
    });

    return done(null, user);

  } catch (err) {
    return done(err, null);
  }
}));

export default passport;