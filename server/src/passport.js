import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "./models/user.models.js";
import { slugifyUsername, validateUsername } from "./utils/validators.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (!user) {
          // New user logic
          const baseUsername = slugifyUsername(profile.displayName, email);
          const maxAttempts = 5;
          let created = false;
          let username = baseUsername;

          for (let attempts = 0; attempts < maxAttempts && !created; attempts++) {
            if (attempts > 0) {
              username = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
            }

            if (!validateUsername(username).valid) continue;

            try {
              const exists = await User.exists({ username });
              if (exists) continue;

              user = await User.create({
                username,
                email,
                googleId: profile.id,
                fullName: profile.displayName,
                avatar: profile.photos?.[0]?.value,
              });
              created = true;
            } catch (err) {
              if (err.code === 11000 && err.keyPattern?.username) {
                continue;
              } else {
                throw err;
              }
            }
          }
          if (!created) {
            throw new Error("Could not generate a unique username");
          }
        } else {
          // Existing user, backfill missing data
          let isModified = false;
          if (!user.googleId) {
            user.googleId = profile.id;
            isModified = true;
          }
          if (!user.fullName) {
            user.fullName = profile.displayName;
            isModified = true;
          }
          if (!user.avatar && profile.photos?.[0]?.value) {
            user.avatar = profile.photos[0].value;
            isModified = true;
          }
          
          if (isModified) {
            await user.save({ validateBeforeSave: false });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
