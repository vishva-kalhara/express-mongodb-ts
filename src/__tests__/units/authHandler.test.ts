import { isPasswordMatch, signJWT } from '../../api/handlers/authHandler';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('Auth Handler Unit Tests', () => {
    describe('isPasswordMatch()', () => {
        const plainPassword = '123456789';
        const hashedPassword =
            '$2b$10$0vDMQ.4DE897jmVJPh/7VO79FaTFXZj1D.NeowmzgyEmXVYjM7P5O';
        it('Should return true if the passwords are matching', async () => {
            const isMacthed = await isPasswordMatch(
                plainPassword,
                hashedPassword
            );
            expect(isMacthed).toBeTruthy();
        });
        it('Should return false if the passwords are not matching', async () => {
            const isMacthed = await isPasswordMatch(
                'false Password',
                hashedPassword
            );
            expect(isMacthed).toBeFalsy();
        });
    });

    describe('signJWT()', () => {
        const mockId = '123456';
        const jwtSecret = process.env.JWT_SECRET as string;
        const jwtExpiresIn = process.env.JWT_EXPIRES_IN as string;

        let mockedToken: string;
        beforeAll(() => {
            mockedToken = jwt.sign({ id: mockId }, jwtSecret, {
                expiresIn: jwtExpiresIn,
            });
        });

        it('should generate the correct token', async () => {
            (jwt.sign as jest.Mock).mockReturnValue(mockedToken);

            const token = signJWT(mockId);

            expect(jwt.sign).toHaveBeenCalledWith({ id: mockId }, jwtSecret, {
                expiresIn: jwtExpiresIn,
            });
            expect(token).toBe(mockedToken);
        });
    });
});
