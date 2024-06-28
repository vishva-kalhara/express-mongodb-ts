import dotenv from 'dotenv';
dotenv.config({ path: '../../configs/.env.test' });
import { Express } from 'express';
import connectDB from '../../api/db';
import { createApp } from '../../api/app';
import request from 'supertest';
import User from '../../api/schemas/userSchema';
import mongoose from 'mongoose';

describe('/api/v1/users', () => {
    let app: Express;
    const userPayLoad = {
        name: 'testName',
        email: 'test@example.com',
        password: '123456789',
        confirmPassword: '123456789',
        role: 'Admin',
    };

    let currentJwt = 'Bearer ';

    beforeAll(async () => {
        await connectDB();
        app = createApp();

        // Create Test user
        await request(app).post('/api/v1/auth/signUp').send(userPayLoad);

        // Sign in using Admin
        const response2 = await request(app).post('/api/v1/auth/signIn').send({
            email: userPayLoad.email,
            password: userPayLoad.password,
        });
        currentJwt += response2.body.jwt;
    });

    afterAll(async () => {
        await User.deleteMany();
        await mongoose.connection.close();
    });

    describe('[PATCH] /updateMe', () => {
        let name = 'updated Name';

        const exec = async () => {
            return await request(app)
                .patch(`/api/v1/users/updateMe`)
                .set('Authorization', currentJwt)
                .send({
                    name,
                    notIncludedField: 'null',
                });
        };

        it('Should return 200 with updated document', async () => {
            const response = await exec();

            expect(response.status).toBe(200);
            expect(response.body.data.doc.name).toBe('updated Name');
            expect(response.body.data.doc.notIncludedField).toBeUndefined();
        });

        it('Should return 401 when the user is not logged in', async () => {
            currentJwt = '';
            const response = await exec();

            expect(response.status).toBe(401);
        });
    });
});
