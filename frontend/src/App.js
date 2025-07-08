import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Register from './components/Register';
import UserProject from './components/UserProject';
import NewProject from './components/NewProject';
import ProjectDetails from './components/ProjectDetails';
import ProjectForm from './components/ProjectForm';
import ProjectReport from './components/ProjectReport';
import EnergyMonitorReport from './components/EnergyMonitorReport';
import NotFound from './components/NotFound';
import Navbar from './components/Navbar';
import Presentation from './static/Presentation';
import UserList from './components/UserList';
import CreateUser from './components/CreateUser';
import SingleLineDiagram from './components/SingleLineDiagram/SingleLineDiagram';
import ElectricalValues from './components/ElectricalValues';
import EnergyDiagramTest from './components/EnergyDiagramTest';
import { useSelector } from 'react-redux';
import './styles/print.css';
import J7LightingReport from './components/reports/J7LightingReport';
import J6hvacReport from './components/reports/J6hvacReport';
import LandingOne from './components/LandingOne';
import LandingTwo from './components/LandingTwo';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  const { isAuthenticated } = useSelector(state => state.auth);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {isAuthenticated && <Navbar />}
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/presentation" element={<Presentation />} />
          <Route path="/prototype" element={<LandingTwo />} />
          <Route path="/" element={isAuthenticated ? <Navigate to="/projects" /> : <LandingOne />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <UserProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <UserProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute>
                <NewProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/edit"
            element={
              <ProtectedRoute>
                <ProjectForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/report"
            element={
              <ProtectedRoute>
                <ProjectReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/j9monitor/:id/report"
            element={
              <ProtectedRoute>
                <EnergyMonitorReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/j7lighting/:id/report"
            element={
              <ProtectedRoute>
                <J7LightingReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/j6hvac/:id/report"
            element={
              <ProtectedRoute>
                <J6hvacReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard (Coming Soon)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <UserList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/new"
            element={
              <ProtectedRoute roles={['admin']}>
                <CreateUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/diagram"
            element={
              <ProtectedRoute>
                <SingleLineDiagram />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/electrical-details"
            element={
              <ProtectedRoute>
                <ElectricalValues />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/energy-diagram-test"
            element={
              <ProtectedRoute>
                <EnergyDiagramTest />
              </ProtectedRoute>
            }
          />

          {/* 404 Route - Catch all unmatched routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
