// require an authenticated session (set by github oauth) before reaching a route
export const ensureauth = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({
        success: false,
        message: 'authentication required, please log in at /auth/github'
    });
};

// require the authenticated user to be an administrator
export const ensureadmin = (req, res, next) => {
    if (req.user && req.user.role === 'administrator') {
        return next();
    }
    res.status(403).json({ success: false, message: 'administrator privileges required' });
};

// true when the user is an administrator or owns the resource
export const isowneroradmin = (user, ownerid) => {
    if (!user) return false;
    return user.role === 'administrator' || String(user._id) === String(ownerid);
};
