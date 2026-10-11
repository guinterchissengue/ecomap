import Cleanup from '../models/Cleanup.js';
import Report from '../models/Report.js';
import { isowneroradmin } from '../middleware/auth.js';

// retrieve all cleanup events
export const getallcleanups = async (req, res, next) => {
    try {
        const cleanups = await Cleanup.find()
            .populate('organizer', 'name neighborhood')
            .populate('report', 'title category')
            .select('-__v');
        res.status(200).json(cleanups);
    } catch (error) {
        next(error);
    }
};

// retrieve a single cleanup event by id
export const getcleanupbyid = async (req, res, next) => {
    try {
        const cleanup = await Cleanup.findById(req.params.id)
            .populate('organizer', 'name neighborhood')
            .populate('report', 'title category')
            .select('-__v');
        if (!cleanup) {
            return res.status(404).json({ success: false, message: 'cleanup not found' });
        }
        res.status(200).json(cleanup);
    } catch (error) {
        next(error);
    }
};

// create a cleanup event, the organizer is always the logged in user
export const createcleanup = async (req, res, next) => {
    try {
        const report = await Report.findById(req.body.report);
        if (!report) {
            return res.status(400).json({ success: false, message: 'invalid report reference' });
        }
        const newcleanup = await Cleanup.create({ ...req.body, organizer: req.user._id });
        res.status(201).json(newcleanup);
    } catch (error) {
        next(error);
    }
};

// update a cleanup event (organizer or administrator)
export const updatecleanup = async (req, res, next) => {
    try {
        const cleanup = await Cleanup.findById(req.params.id);
        if (!cleanup) {
            return res.status(404).json({ success: false, message: 'cleanup not found' });
        }
        if (!isowneroradmin(req.user, cleanup.organizer)) {
            return res.status(403).json({ success: false, message: 'only the organizer can update this cleanup' });
        }
        cleanup.set(req.body);
        await cleanup.save();
        res.status(200).json(cleanup);
    } catch (error) {
        next(error);
    }
};

// delete a cleanup event (organizer or administrator)
export const deletecleanup = async (req, res, next) => {
    try {
        const cleanup = await Cleanup.findById(req.params.id);
        if (!cleanup) {
            return res.status(404).json({ success: false, message: 'cleanup not found' });
        }
        if (!isowneroradmin(req.user, cleanup.organizer)) {
            return res.status(403).json({ success: false, message: 'only the organizer can delete this cleanup' });
        }
        await cleanup.deleteOne();
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
