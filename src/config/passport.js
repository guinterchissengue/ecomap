import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

// true when all github oauth credentials are present in the environment
export const githubconfigured = () =>
    Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.GITHUB_CALLBACK_URL);

// logins listed in ADMIN_GITHUB_USERS (comma separated) become administrators when they sign in
const isadminuser = (username) =>
    (process.env.ADMIN_GITHUB_USERS || '')
        .split(',')
        .map(u => u.trim().toLowerCase())
        .filter(Boolean)
        .includes(String(username).toLowerCase());

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

    if (!githubconfigured()) return;

    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ['user:email']
    }, async (accesstoken, refreshtoken, profile, done) => {
        try {
            // the email can be private on github, so fall back to the noreply address
            const email = (profile.emails?.[0]?.value || `${profile.username}@users.noreply.github.com`).toLowerCase();

            let user = await User.findOne({ githubId: profile.id });
            if (!user) user = await User.findOne({ email });

            if (user) {
                if (!user.githubId) {
                    user.githubId = profile.id;
                    await user.save();
                }
            } else {
                user = await User.create({
                    name: profile.displayName || profile.username,
                    email,
                    githubId: profile.id,
                    neighborhood: 'not specified',
                    role: isadminuser(profile.username) ? 'administrator' : 'citizen'
                });
            }
            done(null, user);
        } catch (error) {
            done(error);
        }
    }));
};