# NCC Compliance Checker Backend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/ncc-compliance
JWT_SECRET=your-secret-key-here
```

3. Start MongoDB server (if not already running)

4. Run the application:
```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

The API documentation is available at:
```
http://localhost:5000/api-docs
```

This provides a Swagger UI interface where you can:
- View all available endpoints
- See request/response schemas
- Test API endpoints directly
- View authentication requirements

## API Endpoints

### Authentication
- POST /api/users/register - Register a new user
- POST /api/users/login - Login user
- POST /api/users/logout - Logout user
- GET /api/users/profile - Get user profile
- PUT /api/users/profile - Update user profile

### Projects
- GET /api/projects - Get all projects for user
- POST /api/projects - Create new project
- GET /api/projects/:id - Get single project
- PUT /api/projects/:id - Update project
- DELETE /api/projects/:id - Delete project

### Reports
- GET /api/reports - Get all reports for user
- GET /api/reports/:projectId - Generate compliance report

## Development

The application uses:
- Express.js for the server
- MongoDB with Mongoose for the database
- JWT for authentication
- Morgan for logging
- CORS for cross-origin requests
- Swagger for API documentation

## Testing

Run tests with:
```bash
npm test
``` 