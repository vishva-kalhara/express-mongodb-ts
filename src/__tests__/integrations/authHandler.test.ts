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
    let passwordResetToken: String;

    const userPayLoad = {
        name: 'testName',
        email: 'test123@gmail.com',
        password: '123456789',
        confirmPassword: '123456789',
        role: 'Admin',
    };

    beforeAll(async () => {
        await connectDB();
        app = createApp();
    });

    afterAll(async () => {
        await User.deleteMany();
        await mongoose.connection.close();
    });

    describe('[POST] /signUp', () => {
        it('Should return the user document with 201 status code', async () => {
            const response = await request(app)
                .post('/api/v1/auth/signUp')
                .send(userPayLoad);
            const { name, email, password, confirmPassword, role } =
                response.body.data.user;
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
        it('Should return 400 when not passing the both email and password', async () => {
            const response = await request(app)
                .post('/api/v1/auth/signIn')
                .send({});
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(
                'Please provide email and password'
            );
        });

        it('Should return 401 when there is not any account associated to the email', async () => {
            const response = await request(app)
                .post('/api/v1/auth/signIn')
                .send({
                    email: 'test123@gma456il.com',
                    password: userPayLoad.password,
                });
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(
                'There is no active user associated to this email'
            );
        });

        it('Should return 401 when the password is incorrect', async () => {
            const response = await request(app)
                .post('/api/v1/auth/signIn')
                .send({
                    email: userPayLoad.email,
                    password: 'userPayLoad.password',
                });
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Password is incorrect.');
        });

        it('Should return 200 when inserting the correct credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/signIn')
                .send({
                    email: userPayLoad.email,
                    password: userPayLoad.password,
                });
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.jwt).toBeTruthy();
        });
    });

    describe('[PATCH] /updateMyPassword', () => {
        let currentJwt = 'Bearer ';
        let updateMyPasswordPayload = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        };

        beforeAll(async () => {
            const response = await request(app)
                .post('/api/v1/auth/signIn')
                .send({
                    email: userPayLoad.email,
                    password: userPayLoad.password,
                });
            currentJwt += response.body.jwt;
        });

        beforeEach(() => {
            updateMyPasswordPayload = {
                currentPassword: '123456789',
                newPassword: '123123123',
                confirmPassword: '123123123',
            };
        });

        it('Should return 400 when the currentPassword is not provided', async () => {
            updateMyPasswordPayload.currentPassword = '';
            const response = await request(app)
                .patch('/api/v1/auth/updateMyPassword')
                .set('Authorization', currentJwt)
                .send(updateMyPasswordPayload);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe(
                'Please provide the current password'
            );
        });

        it('Should return 400 when the newPassword is not provided', async () => {
            updateMyPasswordPayload.newPassword = '';
            const response = await request(app)
                .patch('/api/v1/auth/updateMyPassword')
                .set('Authorization', currentJwt)
                .send(updateMyPasswordPayload);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe(
                'Please provide the new password'
            );
        });

        it('Should return 400 when the confirmPassword is not provided', async () => {
            updateMyPasswordPayload.confirmPassword = '';
            const response = await request(app)
                .patch('/api/v1/auth/updateMyPassword')
                .set('Authorization', currentJwt)
                .send(updateMyPasswordPayload);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe(
                'Please provide the confirm password'
            );
        });

        it('Should return 400 when the current password does not match', async () => {
            updateMyPasswordPayload.currentPassword = 'incorrect password';
            const response = await request(app)
                .patch('/api/v1/auth/updateMyPassword')
                .set('Authorization', currentJwt)
                .send(updateMyPasswordPayload);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe(
                'Current password does not match'
            );
        });

        it('Should return 200 when the password reset is success', async () => {
            const response = await request(app)
                .patch('/api/v1/auth/updateMyPassword')
                .set('Authorization', currentJwt)
                .send(updateMyPasswordPayload);

            expect(response.status).toBe(200);
            expect(response.body.jwt).not.toBe('Bearer ' + currentJwt);
        });
    });

    describe('[GET] /forgetPassword', () => {
        it('Should return 400 when not providing Email', async () => {
            const response = await request(app)
                .get('/api/v1/auth/forgetPassword')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.status).toBe('fail');
        });

        it('Should return 404 when there is no account', async () => {
            const response = await request(app)
                .get('/api/v1/auth/forgetPassword')
                .send({ email: 'invalidEmail@example.com' });

            expect(response.status).toBe(404);
            expect(response.body.status).toBe('fail');
        });

        it('Should return 200 when it is done', async () => {
            const response = await request(app)
                .get('/api/v1/auth/forgetPassword')
                .send({ email: userPayLoad.email });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.token).toBeDefined();
            expect(response.body.token).toHaveLength(6);
            passwordResetToken = response.body.token;
        });
    });

    describe('[PATCH] /updateMyPassword/:token', () => {
        const bodyPayLoad = {
            newPassword: '',
            confirmPassword: '',
        };

        beforeEach(() => {
            bodyPayLoad.newPassword = '123456789';
            bodyPayLoad.confirmPassword = '123456789';
        });

        it('Should return 400 when the newPassword is not provided', async () => {
            bodyPayLoad.newPassword = '';
            const response = await request(app)
                .patch(`/api/v1/auth/updateMyPassword/${passwordResetToken}`)
                .send(bodyPayLoad);

            expect(response.status).toBe(400);
            expect(response.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ field: 'password' }),
                ])
            );
        });

        it('Should return 400 when the confirmPassword is not provided', async () => {
            bodyPayLoad.confirmPassword = '';
            const response = await request(app)
                .patch(`/api/v1/auth/updateMyPassword/${passwordResetToken}`)
                .send(bodyPayLoad);

            expect(response.status).toBe(400);
            expect(response.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ field: 'confirmPassword' }),
                ])
            );
        });

        it('Should return 400 when the passwords are not matching', async () => {
            bodyPayLoad.confirmPassword = '123123123';
            const response = await request(app)
                .patch(`/api/v1/auth/updateMyPassword/${passwordResetToken}`)
                .send(bodyPayLoad);

            expect(response.status).toBe(400);
            expect(response.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        message:
                            'Password and Confirm Password does not match.',
                    }),
                ])
            );
        });

        it('Should return 400 when the token is wrong', async () => {
            const response = await request(app)
                .patch(`/api/v1/auth/updateMyPassword/wrong`)
                .send(bodyPayLoad);

            expect(response.status).toBe(400);
            expect(response.body.status).toBe('fail');
        });

        it('Should return 200 when the reset is success', async () => {
            const response = await request(app)
                .patch(`/api/v1/auth/updateMyPassword/${passwordResetToken}`)
                .send(bodyPayLoad);

            expect(response.status).toBe(200);
        });
    });
});
