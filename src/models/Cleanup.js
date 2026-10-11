import mongoose from 'mongoose';

// define the cleanup schema for community cleanup events linked to a report
const cleanupschema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'title is required'],
        trim: true,
        maxlength: [100, 'title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'description is required'],
        trim: true,
        maxlength: [1000, 'description cannot exceed 1000 characters']
    },
    report: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
        required: [true, 'a cleanup must be linked to a report']
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'a cleanup must have an organizer']
    },
    scheduledDate: {
        type: Date,
        required: [true, 'scheduledDate is required']
    },
    neighborhood: {
        type: String,
        required: [true, 'neighborhood is required'],
        trim: true
    },
    volunteersNeeded: {
        type: Number,
        min: [1, 'volunteersNeeded must be at least 1'],
        max: [1000, 'volunteersNeeded cannot exceed 1000'],
        default: 10
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    }
}, {
    timestamps: true
});

const Cleanup = mongoose.model('Cleanup', cleanupschema);
export default Cleanup;
