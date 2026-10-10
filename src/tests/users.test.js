import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// use a separate test database to avoid deleting production data
const test_db_uri = process.env.MONGODB_URI?.replace('ecomap', 'ecomap_test') || 'mongodb://localhost:27017/ecomap_test';

beforeAll(async () => {
    await mongoose.connect(test_db_uri);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe('Users API Endpoints', () => {
    let createduserid;

    const validuser = {
        name: 'test citizen',
        email: 'testcitizen@example.com',
        neighborhood: 'polana cimento'
    };

    it('should create a new user successfully', async () => {
        const res = await request(app).post('/users').send(validuser);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.email).toEqual(validuser.email);
        createduserid = res.body._id;
    });

    it('should return 409 conflict for duplicate email', async () => {
        const res = await request(app).post('/users').send(validuser);
        expect(res.statusCode).toEqual(409);
        expect(res.body.success).toBe(false);
    });

    it('should return 400 for missing required fields', async () => {
        const res = await request(app).post('/users').send({ name: 'incomplete user' });
        expect(res.statusCode).toEqual(400);
    });

    it('should retrieve all users', async () => {
        const res = await request(app).get('/users');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should retrieve a specific user by id', async () => {
        const res = await request(app).get(`/users/${createduserid}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body._id).toEqual(createduserid);
    });

    it('should return 400 for invalid object id format', async () => {
        const res = await request(app).get('/users/12345invalid');
        expect(res.statusCode).toEqual(400);
    });

    it('should update an existing user', async () => {
        const res = await request(app).put(`/users/${createduserid}`).send({ neighborhood: 'sommerschield' });
        expect(res.statusCode).toEqual(200);
        expect(res.body.neighborhood).toEqual('sommerschield');
    });

    it('should delete a user successfully', async () => {
        const res = await request(app).delete(`/users/${createduserid}`);
        expect(res.statusCode).toEqual(204);
    });

    it('should return 404 for retrieving a deleted user', async () => {
        const res = await request(app).get(`/users/${createduserid}`);
        expect(res.statusCode).toEqual(404);
    });
});