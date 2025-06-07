// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/nccj_test';

// Increase timeout for tests
jest.setTimeout(30000);

// Global beforeAll and afterAll hooks
beforeAll(async () => {
    // Add any global setup here
});

afterAll(async () => {
    // Add any global cleanup here
}); 