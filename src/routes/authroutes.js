import express from 'express';
import passport from 'passport';
import { githubconfigured } from '../config/passport.js';
import { ensureauth } from '../middleware/auth.js';
import { signtoken } from '../middleware/bearer.js';

const router = express.Router();

// refuse the oauth routes with a clear message when github credentials are missing
const requiregithub = (req, res, next) => {
    if (!githubconfigured()) {
        return res.status(503).json({ success: false, message: 'github oauth is not configured on this server' });
    }
    next();
};

// start the github login flow
router.get('/github', requiregithub, passport.authenticate('github', { scope: ['user:email'] }));

// github redirects back here after the user approves
router.get('/github/callback', requiregithub,
    passport.authenticate('github', { failureRedirect: '/auth/failure' }),
    (req, res) => res.redirect('/auth/token')
);

router.get('/failure', (req, res) => {
    res.status(401).json({ success: false, message: 'github authentication failed' });
});

// after logging in, show a token to paste in the swagger authorize button (value field)
router.get('/token', ensureauth, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'copy the token and paste it in the Authorize button of /api-docs (bearerAuth value)',
        token: signtoken(req.user),
        expiresIn: '1d'
    });
});

// return the logged in user (useful to confirm the session in the video)
router.get('/me', ensureauth, (req, res) => {
    res.status(200).json(req.user);
});

// end the session
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.redirect('/api-docs');
        });
    });
});

export default router;
