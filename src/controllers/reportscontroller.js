import Report from '../models/Report.js';
import Cleanup from '../models/Cleanup.js';
import Comment from '../models/Comment.js';
import { isowneroradmin } from '../middleware/auth.js';

// retrieve all reports
export const getallreports = async (req, res, next) => {
    try {
        const reports = await Report.find().populate('reportedBy', 'name neighborhood').select('-__v');
        res.status(200).json(reports);
    } catch (error) {
        next(error);
    }
};

// retrieve a single report by id
export const getreportbyid = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.id).populate('reportedBy', 'name neighborhood').select('-__v');
        if (!report) {
            return res.status(404).json({ success: false, message: 'report not found' });
        }
        res.status(200).json(report);
    } catch (error) {
        next(error);
    }
};

// create a new environmental report, the reporter is always the logged in user
export const createreport = async (req, res, next) => {
    try {
        const newreport = await Report.create({ ...req.body, reportedBy: req.user._id });
        res.status(201).json(newreport);
    } catch (error) {
        next(error);
    }
};

// update an existing report (owner or administrator, only administrators may change the status)
export const updatereport = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, message: 'report not found' });
        }
        if (!isowneroradmin(req.user, report.reportedBy)) {
            return res.status(403).json({ success: false, message: 'you can only update your own reports' });
        }
        if (req.body.status !== undefined && req.user.role !== 'administrator') {
            return res.status(403).json({ success: false, message: 'only administrators can change the report status' });
        }

        report.set(req.body);
        await report.save();
        res.status(200).json(report);
    } catch (error) {
        next(error);
    }
};

// delete an existing report (owner or administrator)
export const deletereport = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, message: 'report not found' });
        }
        if (!isowneroradmin(req.user, report.reportedBy)) {
            return res.status(403).json({ success: false, message: 'you can only delete your own reports' });
        }

        // remove dependent documents so nothing points to a missing report
        await Promise.all([
            Cleanup.deleteMany({ report: report._id }),
            Comment.deleteMany({ report: report._id })
        ]);
        await report.deleteOne();
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
