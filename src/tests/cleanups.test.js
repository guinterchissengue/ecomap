import { jest } from '@jest/globals';
import request from 'supertest';
import { fakequery, validid } from './helpers.js';

// the model is mocked so these unit tests run without a database connection
const Cleanup = { find: jest.fn(), findById: jest.fn() };
jest.unstable_mockModule('../models/Cleanup.js', () => ({ default: Cleanup }));
const { default: app } = await import('../app.js');

const sample = { _id: validid, title: 'beach cleanup', description: 'weekend cleanup', neighborhood: 'costa do sol', status: 'scheduled' };

beforeEach(() => jest.clearAllMocks());

describe('GET /cleanups', () => {
    it('returns 200 and an array with all documents', async () => {
        Cleanup.find.mockReturnValue(fakequery([sample]));
        const res = await request(app).get('/cleanups');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(1);
        expect(res.body[0]._id).toBe(validid);
    });

    it('returns 200 and an empty array when the collection is empty', async () => {
        Cleanup.find.mockReturnValue(fakequery([]));
        const res = await request(app).get('/cleanups');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('returns 500 when the database fails', async () => {
        Cleanup.find.mockReturnValue(fakequery(null, new Error('db down')));
        const res = await request(app).get('/cleanups');
        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
    });
});

describe('GET /cleanups/:id', () => {
    it('returns 200 and the requested document', async () => {
        Cleanup.findById.mockReturnValue(fakequery(sample));
        const res = await request(app).get(`/cleanups/${validid}`);
        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(validid);
        expect(Cleanup.findById).toHaveBeenCalledWith(validid);
    });

    it('returns 404 when the document does not exist', async () => {
        Cleanup.findById.mockReturnValue(fakequery(null));
        const res = await request(app).get(`/cleanups/${validid}`);
        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it('returns 400 for a malformed id without touching the database', async () => {
        const res = await request(app).get('/cleanups/12345invalid');
        expect(res.statusCode).toBe(400);
        expect(Cleanup.findById).not.toHaveBeenCalled();
    });
});
