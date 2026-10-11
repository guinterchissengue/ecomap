import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

// true when all google oauth credentials are present in the environment
export const googleconfigured = () =>
    Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL);

// emails listed in ADMIN_EMAILS (comma separated) become administrators when they sign in
const isadminemail = (email) =>
    (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean)
        .includes(email);

export const configurepassport = () => {
    // store only the user id in the session and reload the user on every request
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id).select('-__v');
            done(null, user || false);
        } catch (error) {
            done(error);
        }
    });

    // the strategy is only registered when credentials exist (keeps tests and local setup simple)
    if (!googleconfigured()) return;

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    }, async (accesstoken, refreshtoken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value?.toLowerCase();
            if (!email) return done(null, false, { message: 'google account has no email' });

            // returning user, or an existing user created earlier with the same email
            let user = await User.findOne({ googleId: profile.id });
            if (!user) user = await User.findOne({ email });

            if (user) {
                if (!user.googleId) {
                    user.googleId = profile.id;
                    await user.save();
                }
            } else {
                user = await User.create({
                    name: profile.displayName || email,
                    email,
                    googleId: profile.id,
                    neighborhood: 'not specified',
                    role: isadminemail(email) ? 'administrator' : 'citizen'
                });
            }
            done(null, user);
        } catch (error) {
            done(error);
        }
    }));
};
