import User from '../models/User.js';
import Report from '../models/Report.js';

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

// create a new user
export const createuser = async (req, res, next) => {
    try {
        // prevent assignment of administrator privileges via public api requests
        const userdata = { ...req.body };
        if (userdata.role === 'administrator') {
            userdata.role = 'citizen';
        }

        const newuser = await User.create(userdata);
        res.status(201).json(newuser);
    } catch (error) {
        next(error);
    }
};

// update an existing user
export const updateuser = async (req, res, next) => {
    try {
        // prevent role escalation during update
        const updatedata = { ...req.body };
        delete updatedata.role;

        const user = await User.findByIdAndUpdate(req.params.id, updatedata, {
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

// delete an existing user safely
export const deleteuser = async (req, res, next) => {
    try {
        // prevent deletion if the user is associated with existing reports
        const associatedreports = await Report.findOne({ reportedBy: req.params.id });
        if (associatedreports) {
            return res.status(409).json({ 
                success: false, 
                message: 'cannot delete user because they have associated environmental reports' 
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'user not found' });
        }
        // return 204 no content on successful deletion
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};