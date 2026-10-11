import { jest } from '@jest/globals';
import request from 'supertest';
import { fakequery, validid } from './helpers.js';

// the model is mocked so these unit tests run without a database connection
const Comment = { find: jest.fn(), findById: jest.fn() };
jest.unstable_mockModule('../models/Comment.js', () => ({ default: Comment }));
const { default: app } = await import('../app.js');

const sample = { _id: validid, text: 'still not collected', report: validid };

beforeEach(() => jest.clearAllMocks());

describe('GET /comments', () => {
    it('returns 200 and an array with all documents', async () => {
        Comment.find.mockReturnValue(fakequery([sample]));
        const res = await request(app).get('/comments');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(1);
        expect(res.body[0]._id).toBe(validid);
    });

    it('returns 200 and an empty array when the collection is empty', async () => {
        Comment.find.mockReturnValue(fakequery([]));
        const res = await request(app).get('/comments');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('returns 500 when the database fails', async () => {
        Comment.find.mockReturnValue(fakequery(null, new Error('db down')));
        const res = await request(app).get('/comments');
        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
    });
});

describe('GET /comments/:id', () => {
    it('returns 200 and the requested document', async () => {
        Comment.findById.mockReturnValue(fakequery(sample));
        const res = await request(app).get(`/comments/${validid}`);
        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(validid);
        expect(Comment.findById).toHaveBeenCalledWith(validid);
    });

    it('returns 404 when the document does not exist', async () => {
        Comment.findById.mockReturnValue(fakequery(null));
        const res = await request(app).get(`/comments/${validid}`);
        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it('returns 400 for a malformed id without touching the database', async () => {
        const res = await request(app).get('/comments/12345invalid');
        expect(res.statusCode).toBe(400);
        expect(Comment.findById).not.toHaveBeenCalled();
    });
});
