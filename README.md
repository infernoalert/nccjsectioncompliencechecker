# NCC Section J Compliance Checker

A full-stack application for checking NCC Section J compliance, built with Express.js, React, and MongoDB.

## Project Structure

```
.
├── backend/           # Express.js server
│   ├── controllers/  # API controllers
│   ├── middleware/   # Express middleware
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   ├── utils/        # Utility functions
│   └── server.js     # Express server entry point
├── frontend/         # React application
│   ├── public/       # Static files
│   └── src/          # React source code
│       ├── components/ # React components
│       ├── store/     # Redux store and slices
│       └── App.js     # React application entry point
└── mongodb-data/     # MongoDB data directory
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (v4.4 or higher)

## Getting Started

Follow these steps in order to start the application:

### 1. Start MongoDB

First, ensure MongoDB is running on your system:

```bash
# Start MongoDB service (Windows)
net start MongoDB

# Check MongoDB service status
sc query MongoDB
```

### 2. Start the Backend Server

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ncc-compliance
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The backend server will start on http://localhost:5000

### 3. Start the Frontend Application

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend application will start on http://localhost:3000

## Available Scripts

### Backend
- `npm run dev`: Starts the development server with nodemon
- `npm start`: Starts the production server

### Frontend
- `npm start`: Starts the development server
- `npm build`: Builds the app for production
- `npm test`: Runs the test suite
- `npm run eject`: Ejects from Create React App

## API Documentation

The backend API is available at `http://localhost:5000`

### Authentication Endpoints
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login user
- `GET /api/auth/me`: Get current user

### User Management Endpoints (Admin Only)
- `GET /api/users`: Get all users
- `POST /api/users`: Create a new user
- `PUT /api/users/:id`: Update a user
- `DELETE /api/users/:id`: Delete a user

### Project Endpoints
- `GET /api/projects`: Get all projects
- `POST /api/projects`: Create a new project
- `PUT /api/projects/:id`: Update a project
- `DELETE /api/projects/:id`: Delete a project

## User Roles and Permissions

### Default User Role
When a user signs up, they are automatically assigned the 'user' role. This role has access to:
- View and check building compliance
- Create and manage their own projects
- View compliance reports

### Admin Role
The admin role has additional permissions:
- Manage user roles
- Override compliance rules
- Manage special requirements
- Access admin dashboard

### Changing User Role to Admin
To change a user's role to admin, you need to make an API request with admin credentials:

1. First, obtain an admin token by logging in with an admin account
2. Make a PUT request to update the user's role:

```bash
curl -X PUT http://localhost:5000/api/users/:userId/role \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

Replace:
- `:userId` with the ID of the user you want to make admin
- `YOUR_ADMIN_TOKEN` with a valid JWT token from an admin account

Note: Only existing admin users can promote other users to admin role. This is a security measure to prevent unauthorized role changes.

## Troubleshooting

1. If MongoDB fails to start:
   - Check if the MongoDB service is installed
   - Try running MongoDB manually: `mongod --dbpath ./mongodb-data`

2. If the backend fails to start:
   - Check if MongoDB is running
   - Verify the .env file exists with correct values
   - Check if port 5000 is available

3. If the frontend fails to start:
   - Check if port 3000 is available
   - Verify all dependencies are installed
   - Clear npm cache: `npm cache clean --force`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.