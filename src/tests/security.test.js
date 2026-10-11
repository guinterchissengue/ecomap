import request from 'supertest';
import app from '../app.js';
import { validatebody, reportrules, cleanuprules, commentrules, userrules } from '../middleware/validate.js';

const id = '64b7f0c2a1b2c3d4e5f60718';

// every write route is protected, so an anonymous request must be rejected before any database call
describe('protected routes require authentication (401)', () => {
    const cases = [
        ['post', '/reports'], ['put', `/reports/${id}`], ['delete', `/reports/${id}`],
        ['post', '/cleanups'], ['put', `/cleanups/${id}`], ['delete', `/cleanups/${id}`],
        ['post', '/comments'], ['put', `/comments/${id}`], ['delete', `/comments/${id}`],
        ['post', '/users'], ['put', `/users/${id}`], ['delete', `/users/${id}`]
    ];
    it.each(cases)('%s %s', async (method, path) => {
        const res = await request(app)[method](path).send({});
        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('GET /auth/me requires a session', async () => {
        const res = await request(app).get('/auth/me');
        expect(res.statusCode).toBe(401);
    });

    it('GET /auth/github answers 503 when oauth credentials are not configured', async () => {
        const res = await request(app).get('/auth/github');
        expect(res.statusCode).toBe(503);
    });
});

// run the validation middleware directly with fake req/res objects
const run = (rules, body, options) => {
    const req = { body };
    const res = { statusCode: null, body: null, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };
    let called = false;
    validatebody(rules, options)(req, res, () => { called = true; });
    return { req, res, called };
};

describe('data validation returns 400 when requirements are not met', () => {
    it('reports: rejects missing fields, bad category and bad coordinates on POST', () => {
        expect(run(reportrules.create, {}).res.statusCode).toBe(400);
        expect(run(reportrules.create, { title: 't', description: 'd', category: 'nope', location: { neighborhood: 'x' } }).res.statusCode).toBe(400);
        expect(run(reportrules.create, { title: 't', description: 'd', category: 'other', location: { neighborhood: 'x', coordinates: [500, 0] } }).res.statusCode).toBe(400);
    });
    it('reports: accepts a valid POST and strips protected fields', () => {
        const r = run(reportrules.create, { title: 't', description: 'd', category: 'other', location: { neighborhood: 'x' }, status: 'resolved', reportedBy: 'hacker' });
        expect(r.called).toBe(true);
        expect(r.req.body.status).toBeUndefined();
        expect(r.req.body.reportedBy).toBeUndefined();
    });
    it('reports: rejects an empty or invalid PUT', () => {
        expect(run(reportrules.update, {}, { partial: true }).res.statusCode).toBe(400);
        expect(run(reportrules.update, { status: 'done' }, { partial: true }).res.statusCode).toBe(400);
    });
    it('cleanups: rejects bad report id, bad date and bad volunteers on POST', () => {
        const ok = { title: 't', description: 'd', report: '64b7f0c2a1b2c3d4e5f60718', scheduledDate: '2026-12-01', neighborhood: 'n' };
        expect(run(cleanuprules.create, ok).called).toBe(true);
        expect(run(cleanuprules.create, { ...ok, report: 'abc' }).res.statusCode).toBe(400);
        expect(run(cleanuprules.create, { ...ok, scheduledDate: 'not a date' }).res.statusCode).toBe(400);
        expect(run(cleanuprules.create, { ...ok, volunteersNeeded: 0 }).res.statusCode).toBe(400);
    });
    it('cleanups: rejects an invalid status on PUT', () => {
        expect(run(cleanuprules.update, { status: 'later' }, { partial: true }).res.statusCode).toBe(400);
    });
    it('comments: rejects missing or too long text', () => {
        expect(run(commentrules.create, { report: '64b7f0c2a1b2c3d4e5f60718' }).res.statusCode).toBe(400);
        expect(run(commentrules.update, { text: 'x'.repeat(501) }, { partial: true }).res.statusCode).toBe(400);
    });
    it('users: rejects bad email and does not allow role changes on PUT', () => {
        expect(run(userrules.create, { name: 'a', email: 'bad', neighborhood: 'n' }).res.statusCode).toBe(400);
        const r = run(userrules.update, { neighborhood: 'n', role: 'administrator' }, { partial: true });
        expect(r.called).toBe(true);
        expect(r.req.body.role).toBeUndefined();
    });
});
