import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const jwtsecret = () => process.env.SESSION_SECRET || 'development-only-secret';

// create a token for a user that has logged in with github (valid for 1 day)
export const signtoken = (user) => jwt.sign({ id: String(user._id) }, jwtsecret(), { expiresIn: '1d' });

// accept "Authorization: Bearer <token>" as an alternative to the session cookie (used by the swagger authorize button)
export const bearerauth = async (req, res, next) => {
    try {
        const header = req.headers.authorization || '';
        if (req.user || !header.startsWith('Bearer ')) return next();

        const payload = jwt.verify(header.slice(7).trim(), jwtsecret());
        const user = await User.findById(payload.id).select('-__v');
        if (user) {
            req.user = user;
            req.isAuthenticated = () => true;
        }
        next();
    } catch (error) {
        // invalid or expired token: continue unauthenticated so protected routes answer 401
        next();
    }
};
