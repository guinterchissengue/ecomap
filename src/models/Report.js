import mongoose from 'mongoose';

// define the report schema for environmental problems
const reportschema = new mongoose.Schema({
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
    category: {
        type: String,
        required: [true, 'category is required'],
        enum: [
            'illegal_dumping',
            'blocked_drain',
            'water_pollution',
            'air_pollution',
            'burning',
            'illegal_tree_cutting',
            'other'
        ]
    },
    location: {
        neighborhood: {
            type: String,
            required: [true, 'neighborhood is required'],
            trim: true
        },
        address: {
            type: String,
            trim: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude] format for geojson compatibility
            validate: {
                validator: function(v) {
                    if (!v || v.length === 0) return true; // coordinates are optional
                    if (v.length !== 2) return false;
                    const [lng, lat] = v;
                    return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
                },
                message: 'coordinates must be an array of [longitude, latitude] within valid ranges'
            }
        }
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'resolved'],
        default: 'pending'
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'a report must be associated with a user']
    }
}, {
    timestamps: true // automatically adds createdAt and updatedAt
});

const Report = mongoose.model('Report', reportschema);
export default Report;