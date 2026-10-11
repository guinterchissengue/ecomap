import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { fakequery, validid } from './helpers.js';

const User = { find: jest.fn(), findById: jest.fn() };
jest.unstable_mockModule('../models/User.js', () => ({ default: User }));
const { default: app } = await import('../app.js');

beforeEach(() => jest.clearAllMocks());

describe('bearer token authentication (swagger Authorize button)', () => {
    it('rejects an invalid token with 401', async () => {
        const res = await request(app).get('/auth/me').set('Authorization', 'Bearer not-a-real-token');
        expect(res.statusCode).toBe(401);
    });

    it('accepts a valid token and returns the user', async () => {
        const token = jwt.sign({ id: validid }, 'development-only-secret', { expiresIn: '1h' });
        User.findById.mockReturnValue(fakequery({ _id: validid, name: 'tester', role: 'citizen' }));
        const res = await request(app).get('/auth/me').set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('tester');
    });

    it('rejects an expired token with 401', async () => {
        const token = jwt.sign({ id: validid }, 'development-only-secret', { expiresIn: -10 });
        const res = await request(app).get('/auth/me').set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(401);
    });
});
