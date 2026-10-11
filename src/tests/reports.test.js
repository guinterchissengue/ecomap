import { jest } from '@jest/globals';
import request from 'supertest';
import { fakequery, validid } from './helpers.js';

// the model is mocked so these unit tests run without a database connection
const Report = { find: jest.fn(), findById: jest.fn() };
jest.unstable_mockModule('../models/Report.js', () => ({ default: Report }));
const { default: app } = await import('../app.js');

const sample = { _id: validid, title: 'dumping near market', description: 'plastic waste', category: 'illegal_dumping', status: 'pending' };

beforeEach(() => jest.clearAllMocks());

describe('GET /reports', () => {
    it('returns 200 and an array with all documents', async () => {
        Report.find.mockReturnValue(fakequery([sample]));
        const res = await request(app).get('/reports');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(1);
        expect(res.body[0]._id).toBe(validid);
    });

    it('returns 200 and an empty array when the collection is empty', async () => {
        Report.find.mockReturnValue(fakequery([]));
        const res = await request(app).get('/reports');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('returns 500 when the database fails', async () => {
        Report.find.mockReturnValue(fakequery(null, new Error('db down')));
        const res = await request(app).get('/reports');
        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
    });
});

describe('GET /reports/:id', () => {
    it('returns 200 and the requested document', async () => {
        Report.findById.mockReturnValue(fakequery(sample));
        const res = await request(app).get(`/reports/${validid}`);
        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(validid);
        expect(Report.findById).toHaveBeenCalledWith(validid);
    });

    it('returns 404 when the document does not exist', async () => {
        Report.findById.mockReturnValue(fakequery(null));
        const res = await request(app).get(`/reports/${validid}`);
        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it('returns 400 for a malformed id without touching the database', async () => {
        const res = await request(app).get('/reports/12345invalid');
        expect(res.statusCode).toBe(400);
        expect(Report.findById).not.toHaveBeenCalled();
    });
});
