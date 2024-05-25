import mongoose from 'mongoose';

beforeAll(async () => {
  const mongoUri: string = 'mongodb://localhost/mongoose-ts-test';

  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
});
