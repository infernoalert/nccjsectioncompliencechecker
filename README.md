# Full Stack Application

A modern full-stack application built with Express.js, React, and MongoDB.

## Project Structure

```
.
├── backend/           # Express.js server
├── frontend/          # React application
└── mongodb-data/      # MongoDB data directory
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (v4.4 or higher)

## Getting Started

### Backend Setup

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
   MONGODB_URI=mongodb://localhost:27017/your-database-name
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
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

### MongoDB Setup

1. Make sure MongoDB is installed on your system
2. Start MongoDB service (run in Administrator PowerShell or Command Prompt):
   ```bash
   # Start MongoDB service
   net start MongoDB

   # Stop MongoDB service
   net stop MongoDB

   # Check MongoDB service status
   sc query MongoDB
   ```
3. The application will automatically create the database in the mongodb-data directory

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

The backend API will be available at `http://localhost:5000`

### Endpoints

- `GET /`: Welcome message
- More endpoints will be added as the application develops

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.