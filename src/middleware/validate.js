import mongoose from 'mongoose';

// validate one value against a rule, returning an error message or null
const checkvalue = (field, value, rule) => {
    switch (rule.type) {
        case 'string':
            if (typeof value !== 'string' || value.trim().length === 0) return `${field} must be a non-empty string`;
            if (rule.max && value.trim().length > rule.max) return `${field} cannot exceed ${rule.max} characters`;
            if (rule.pattern && !rule.pattern.test(value.trim())) return rule.message || `${field} is invalid`;
            return null;
        case 'enum':
            return rule.values.includes(value) ? null : `${field} must be one of: ${rule.values.join(', ')}`;
        case 'objectid':
            return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value) && /^[a-f\d]{24}$/i.test(value)
                ? null : `${field} must be a valid id`;
        case 'date':
            return (typeof value === 'string' || typeof value === 'number') && !Number.isNaN(new Date(value).getTime())
                ? null : `${field} must be a valid date`;
        case 'number':
            if (typeof value !== 'number' || !Number.isFinite(value)) return `${field} must be a number`;
            if (rule.min !== undefined && value < rule.min) return `${field} must be at least ${rule.min}`;
            if (rule.max !== undefined && value > rule.max) return `${field} cannot exceed ${rule.max}`;
            return null;
        case 'custom':
            return rule.validate(value);
        default:
            return null;
    }
};

// build a middleware that validates req.body for post (all required fields) or put (partial update)
// unknown fields are dropped so clients cannot set protected fields such as organizer or githubId
export const validatebody = (rules, { partial = false } = {}) => (req, res, next) => {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({ success: false, message: 'request body must be a json object' });
    }

    const errors = [];
    const clean = {};

    for (const [field, rule] of Object.entries(rules)) {
        const value = body[field];
        if (value === undefined || value === null) {
            if (!partial && rule.required) errors.push(`${field} is required`);
            else if (partial && value === null) errors.push(`${field} cannot be null`);
            continue;
        }
        const error = checkvalue(field, value, rule);
        if (error) errors.push(error);
        else clean[field] = typeof value === 'string' ? value.trim() : value;
    }

    if (partial && errors.length === 0 && Object.keys(clean).length === 0) {
        errors.push(`provide at least one updatable field: ${Object.keys(rules).join(', ')}`);
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    req.body = clean;
    next();
};

// reusable rule sets for every collection ---------------------------------

const locationrule = {
    type: 'custom',
    required: true,
    validate: (v) => {
        if (typeof v !== 'object' || Array.isArray(v)) return 'location must be an object';
        if (typeof v.neighborhood !== 'string' || !v.neighborhood.trim()) return 'location.neighborhood is required';
        if (v.address !== undefined && typeof v.address !== 'string') return 'location.address must be a string';
        if (v.coordinates !== undefined) {
            const c = v.coordinates;
            if (!Array.isArray(c) || c.length !== 2 || !c.every(n => typeof n === 'number')) {
                return 'location.coordinates must be [longitude, latitude]';
            }
            if (c[0] < -180 || c[0] > 180 || c[1] < -90 || c[1] > 90) return 'location.coordinates out of range';
        }
        return null;
    }
};

const categories = ['illegal_dumping', 'blocked_drain', 'water_pollution', 'air_pollution', 'burning', 'illegal_tree_cutting', 'other'];

export const userrules = {
    create: {
        name: { type: 'string', required: true, max: 100 },
        email: { type: 'string', required: true, pattern: /^\S+@\S+\.\S+$/, message: 'please provide a valid email address' },
        neighborhood: { type: 'string', required: true, max: 100 },
        role: { type: 'enum', values: ['citizen', 'administrator'] }
    },
    update: {
        name: { type: 'string', max: 100 },
        email: { type: 'string', pattern: /^\S+@\S+\.\S+$/, message: 'please provide a valid email address' },
        neighborhood: { type: 'string', max: 100 }
    }
};

export const reportrules = {
    create: {
        title: { type: 'string', required: true, max: 100 },
        description: { type: 'string', required: true, max: 1000 },
        category: { type: 'enum', required: true, values: categories },
        location: locationrule
    },
    update: {
        title: { type: 'string', max: 100 },
        description: { type: 'string', max: 1000 },
        category: { type: 'enum', values: categories },
        location: { ...locationrule, required: false },
        status: { type: 'enum', values: ['pending', 'in_progress', 'resolved'] }
    }
};

export const cleanuprules = {
    create: {
        title: { type: 'string', required: true, max: 100 },
        description: { type: 'string', required: true, max: 1000 },
        report: { type: 'objectid', required: true },
        scheduledDate: { type: 'date', required: true },
        neighborhood: { type: 'string', required: true, max: 100 },
        volunteersNeeded: { type: 'number', min: 1, max: 1000 }
    },
    update: {
        title: { type: 'string', max: 100 },
        description: { type: 'string', max: 1000 },
        scheduledDate: { type: 'date' },
        neighborhood: { type: 'string', max: 100 },
        volunteersNeeded: { type: 'number', min: 1, max: 1000 },
        status: { type: 'enum', values: ['scheduled', 'completed', 'cancelled'] }
    }
};

export const commentrules = {
    create: {
        report: { type: 'objectid', required: true },
        text: { type: 'string', required: true, max: 500 }
    },
    update: {
        text: { type: 'string', max: 500 }
    }
};
