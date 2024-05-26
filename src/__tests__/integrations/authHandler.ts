import dotenv from 'dotenv';
dotenv.config({ path: '../../configs/.env.test' });
import request from 'supertest';
import { createApp } from '../../api/app';
import { Express } from 'express';
import connectDB from '../../api/db';
import User from '../../api/schemas/userSchema';
import mongoose from 'mongoose';
// import mongoose from 'mongoose';

describe('/api/v1/auth', () => {
    let app: Express;

    beforeAll(async () => {
        await connectDB();
        app = createApp();
    });

    afterAll(async () => {
        await User.deleteMany();
        await mongoose.connection.close();
    });

    describe('[POST] /signUp', () => {
        const userPayLoad = {
            name: 'Wishva',
            email: 'wishvakalhara123@gmail.com',
            password: '123456789',
            confirmPassword: '123456789',
            role: 'Admin',
        };
        it('Should return the user document with 201 status code', async () => {
            const response = await request(app)
                .post('/api/v1/auth/signUp')
                .send(userPayLoad);
            const { name, email, password, confirmPassword, role } =
                response.body.data;
            expect(response.status).toBe(201);
            expect(response.headers['content-type']).toEqual(
                expect.stringContaining('json')
            );
            expect(name).toBe(userPayLoad.name);
            expect(email).toBe(userPayLoad.email);
            expect(password).not.toBe(userPayLoad.password);
            expect(confirmPassword).toBeFalsy();
            expect(role).toBe('User');
        });
        it('Should return the error with 400 status code when trying to create two accounts with same email', async () => {
            const response = await request(app)
                .post('/api/v1/auth/signUp')
                .send(userPayLoad);
            expect(response.status).toBe(400);
            expect(response.headers['content-type']).toEqual(
                expect.stringContaining('json')
            );
            expect(response.body.message).toContain(
                'There is a record associated'
            );
        });
    });

    describe('[POST] /signIn', () => {
        it('Should return 400 when not passing the both email and password', () => {});

        it('Should return 401 when there is not any account associated to the email', () => {});

        it('Should return 401 when the password is incorrect', () => {});

        it('Should return 200 when inserting the correct credentials', () => {
            // Expect
        });
    });
});
