import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Report from '../src/models/Report.js';
import dotenv from 'dotenv';

dotenv.config();

const test_db_uri = process.env.MONGODB_URI?.replace('ecomap', 'ecomap_test') || 'mongodb://localhost:27017/ecomap_test';

beforeAll(async () => {
    await mongoose.connect(test_db_uri);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe('Reports API Endpoints', () => {
    let testuserid;
    let createdreportid;

    beforeAll(async () => {
        // create a test user first since reports require a valid reportedBy reference
        const user = await User.create({
            name: 'reporter name',
            email: 'reporter@example.com',
            neighborhood: 'central'
        });
        testuserid = user._id.toString();
    });

    const validreport = {
        title: 'illegal dumping near market',
        description: 'large pile of plastic waste',
        category: 'illegal_dumping',
        location: {
            neighborhood: 'central',
            coordinates: [32.5892, -25.9692]
        }
    };

    it('should return 400 if reportedBy user is missing or invalid', async () => {
        const res = await request(app).post('/reports').send(validreport);
        expect(res.statusCode).toEqual(400);
    });

    it('should create a new report successfully', async () => {
        const payload = { ...validreport, reportedBy: testuserid };
        const res = await request(app).post('/reports').send(payload);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.status).toEqual('pending'); // default status
        createdreportid = res.body._id;
    });

    it('should return 400 for invalid category enum', async () => {
        const payload = { ...validreport, category: 'not_a_real_category', reportedBy: testuserid };
        const res = await request(app).post('/reports').send(payload);
        expect(res.statusCode).toEqual(400);
    });

    it('should retrieve all reports', async () => {
        const res = await request(app).get('/reports');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should update a report status and persist it to the database', async () => {
        const res = await request(app).put(`/reports/${createdreportid}`).send({ status: 'in_progress' });
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('in_progress');

        // verify persistence
        const dbcheck = await request(app).get(`/reports/${createdreportid}`);
        expect(dbcheck.body.status).toEqual('in_progress');
    });

    it('should prevent deletion of a user if associated reports exist', async () => {
        const res = await request(app).delete(`/users/${testuserid}`);
        expect(res.statusCode).toEqual(409); // conflict because the report still exists
    });

    it('should delete a report successfully', async () => {
        const res = await request(app).delete(`/reports/${createdreportid}`);
        expect(res.statusCode).toEqual(204);
    });
});