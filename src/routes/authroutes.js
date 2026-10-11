import express from 'express';
import passport from 'passport';
import { googleconfigured } from '../config/passport.js';
import { ensureauth } from '../middleware/auth.js';

const router = express.Router();

// refuse the oauth routes with a clear message when google credentials are missing
const requiregoogle = (req, res, next) => {
    if (!googleconfigured()) {
        return res.status(503).json({ success: false, message: 'google oauth is not configured on this server' });
    }
    next();
};

// start the google login flow
router.get('/google', requiregoogle, passport.authenticate('google', { scope: ['profile', 'email'] }));

// google redirects back here after the user approves
router.get('/google/callback', requiregoogle,
    passport.authenticate('google', { failureRedirect: '/auth/failure' }),
    (req, res) => res.redirect('/api-docs')
);

router.get('/failure', (req, res) => {
    res.status(401).json({ success: false, message: 'google authentication failed' });
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
