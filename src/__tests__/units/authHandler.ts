import { isPasswordMatch } from '../../api/handlers/authHandler';

describe('Supportive functions', () => {
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
});
