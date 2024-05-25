import { IUserInput } from '../api/types/userTypes';

export const dummyUsers: IUserInput[] = [
    {
        name: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        confirmPassword: 'admin123',
        role: 'Admin',
        isActive: true,
    },
];
