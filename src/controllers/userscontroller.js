import User from '../models/User.js';
import Report from '../models/Report.js';
import Cleanup from '../models/Cleanup.js';
import Comment from '../models/Comment.js';
import { isowneroradmin } from '../middleware/auth.js';

// retrieve all users
export const getallusers = async (req, res, next) => {
    try {
        const users = await User.find().select('-__v');
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

// retrieve a single user by id
export const getuserbyid = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-__v');
        if (!user) {
            return res.status(404).json({ success: false, message: 'user not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

// create a new user (administrators only, regular users are created by signing in with github)
export const createuser = async (req, res, next) => {
    try {
        const newuser = await User.create(req.body);
        res.status(201).json(newuser);
    } catch (error) {
        next(error);
    }
};

// update an existing user (the user themself or an administrator)
export const updateuser = async (req, res, next) => {
    try {
        if (!isowneroradmin(req.user, req.params.id)) {
            return res.status(403).json({ success: false, message: 'you can only update your own profile' });
        }

        // role is not part of the update rules, so privilege escalation is impossible here
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).select('-__v');

        if (!user) {
            return res.status(404).json({ success: false, message: 'user not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

// delete an existing user safely (the user themself or an administrator)
export const deleteuser = async (req, res, next) => {
    try {
        if (!isowneroradmin(req.user, req.params.id)) {
            return res.status(403).json({ success: false, message: 'you can only delete your own account' });
        }

        // prevent deletion if the user still owns any related documents
        const id = req.params.id;
        const [report, cleanup, comment] = await Promise.all([
            Report.findOne({ reportedBy: id }),
            Cleanup.findOne({ organizer: id }),
            Comment.findOne({ author: id })
        ]);
        if (report || cleanup || comment) {
            return res.status(409).json({
                success: false,
                message: 'cannot delete user because they have associated reports, cleanups or comments'
            });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'user not found' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
