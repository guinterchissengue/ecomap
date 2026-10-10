import Report from '../models/Report.js';
import User from '../models/User.js';

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

// create a new environmental report
export const createreport = async (req, res, next) => {
    try {
        // verify that the reporting user actually exists
        const user = await User.findById(req.body.reportedBy);
        if (!user) {
            return res.status(400).json({ success: false, message: 'invalid reporting user reference' });
        }

        const newreport = await Report.create(req.body);
        res.status(201).json(newreport);
    } catch (error) {
        next(error);
    }
};

// update an existing report (e.g., changing status to in_progress)
export const updatereport = async (req, res, next) => {
    try {
        const report = await Report.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!report) {
            return res.status(404).json({ success: false, message: 'report not found' });
        }
        res.status(200).json(report);
    } catch (error) {
        next(error);
    }
};

// delete an existing report
export const deletereport = async (req, res, next) => {
    try {
        const report = await Report.findByIdAndDelete(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, message: 'report not found' });
        }
        // return 204 no content on successful deletion
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};