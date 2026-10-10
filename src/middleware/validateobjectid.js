import mongoose from 'mongoose';

// middleware to validate if the id parameter is a valid mongodb objectid
export const validateobjectid = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: 'invalid resource id format'
        });
    }
    next();
};