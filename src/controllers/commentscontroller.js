import Comment from '../models/Comment.js';
import Report from '../models/Report.js';
import { isowneroradmin } from '../middleware/auth.js';

// retrieve all comments
export const getallcomments = async (req, res, next) => {
    try {
        const comments = await Comment.find().populate('author', 'name').select('-__v');
        res.status(200).json(comments);
    } catch (error) {
        next(error);
    }
};

// retrieve a single comment by id
export const getcommentbyid = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id).populate('author', 'name').select('-__v');
        if (!comment) {
            return res.status(404).json({ success: false, message: 'comment not found' });
        }
        res.status(200).json(comment);
    } catch (error) {
        next(error);
    }
};

// create a comment on a report, the author is always the logged in user
export const createcomment = async (req, res, next) => {
    try {
        const report = await Report.findById(req.body.report);
        if (!report) {
            return res.status(400).json({ success: false, message: 'invalid report reference' });
        }
        const newcomment = await Comment.create({ ...req.body, author: req.user._id });
        res.status(201).json(newcomment);
    } catch (error) {
        next(error);
    }
};

// update a comment (author or administrator)
export const updatecomment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ success: false, message: 'comment not found' });
        }
        if (!isowneroradmin(req.user, comment.author)) {
            return res.status(403).json({ success: false, message: 'you can only edit your own comments' });
        }
        comment.set(req.body);
        await comment.save();
        res.status(200).json(comment);
    } catch (error) {
        next(error);
    }
};

// delete a comment (author or administrator)
export const deletecomment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ success: false, message: 'comment not found' });
        }
        if (!isowneroradmin(req.user, comment.author)) {
            return res.status(403).json({ success: false, message: 'you can only delete your own comments' });
        }
        await comment.deleteOne();
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
