import mongoose from 'mongoose';

// define the comment schema for discussion on environmental reports
const commentschema = new mongoose.Schema({
    report: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
        required: [true, 'a comment must be linked to a report']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'a comment must have an author']
    },
    text: {
        type: String,
        required: [true, 'text is required'],
        trim: true,
        maxlength: [500, 'text cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

const Comment = mongoose.model('Comment', commentschema);
export default Comment;
