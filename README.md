**************************************
**COPY .ENV FOR BOTH FRONT AND BACK **
**************************************
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
│   ├── services/     # Business logic services
│   ├── data/         # Data files and decision trees
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
- PM2 (for production deployment)

## Getting Started

Follow these steps in order to start the application:

### 1. Environment Setup

Before starting the application, you need to set up the environment files:

1. For the backend:
   - Copy `.env.development` to `.env` in the backend directory for development
   - Copy `.env.production` to `.env` in the backend directory for production

2. For the frontend:
   - Copy `.env.development` to `.env` in the frontend directory for development
   - Copy `.env.production` to `.env` in the frontend directory for production

### 2. Start MongoDB

First, ensure MongoDB is running on your system:

```bash
# Start MongoDB service (Windows)
net start MongoDB

# Check MongoDB service status
sc query MongoDB
```

### 3. Start the Backend Server

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The backend server will start on http://localhost:5000

### 4. Start the Frontend Application

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
- `npm start` or `npm run start:prod`: Starts the production server
- `npm run start:dev`: Starts the development server (same as `npm run dev`)
- `npm test`: Runs the test suite
- `npm run pm2:start`: Starts the application with PM2 in production mode
- `npm run pm2:stop`: Stops the PM2 application
- `npm run pm2:restart`: Restarts the PM2 application
- `npm run pm2:delete`: Deletes the PM2 application
- `npm run pm2:logs`: Shows the PM2 logs
- `npm run pm2:monit`: Opens the PM2 monitoring interface
- `npm run pm2:status`: Shows the PM2 status

### Frontend
- `npm start` or `npm run start:dev`: Starts the development server
- `npm run start:prod`: Starts the production server
- `npm run build`: Builds the app for production
- `npm run build:dev`: Builds the app for development
- `npm test`: Runs the test suite
- `npm run eject`: Ejects from Create React App

## Production Deployment

### Backend Deployment with PM2

PM2 is a process manager for Node.js applications that helps keep your application running 24/7 and provides features like automatic restarts, load balancing, and monitoring.

1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Run the deployment script:
   - On Windows:
     ```bash
     deploy.bat
     ```
   - On Linux/Mac:
     ```bash
     ./deploy.sh
     ```

4. Alternatively, you can manually deploy:
   ```bash
   # Copy production environment file
   copy .env.production .env
   
   # Start with PM2
   npm run pm2:start
   ```

5. To monitor your application:
   ```bash
   npm run pm2:monit
   ```

6. To view logs:
   ```bash
   npm run pm2:logs
   ```

### Frontend Deployment

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Deploy the `build` directory to your web server.

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

4. If PM2 fails to start:
   - Check if PM2 is installed globally
   - Verify the ecosystem.config.js file exists
   - Check the PM2 logs: `pm2 logs`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Database Seeding

To seed the database with initial data, use the following command:

```bash
node -r dotenv/config seeder.js -i dotenv_config_path=.env.production
```

This command:
- Uses `dotenv/config` to load environment variables
- Runs the seeder script with the `-i` flag to import data
- Uses `.env.production` for production environment configuration
- Will seed the database with:
  - Climate zones
  - Compliance pathways
  - Special requirements
  - Building classifications

The seeder will construct the MongoDB URI from individual environment variables:
- MONGO_USER
- MONGO_PASSWORD
- MONGO_PATH
- MONGO_PORT
- MONGO_DATABASE

Make sure your `.env.production` file contains all required MongoDB configuration variables before running the seeder.