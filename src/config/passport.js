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

    // the strategy is only registered when credentials exist (keeps tests and local setup simple)
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

            // returning user, or an existing user created earlier with the same email
            let user = await User.findOne({ githubId: profile.id });
            if (!user) user = await User.findOne({ email });

            if (user) {
                // link the github id without re-validating the whole document (old documents may miss fields)
                await User.updateOne({ _id: user._id }, { $set: { githubId: profile.id } });
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
