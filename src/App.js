import { lazy, useEffect } from 'react';

import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { themeChange } from 'theme-change';
import { LoadScript } from '@react-google-maps/api';
import './App.css';
import auth from './app/auth';
import initializeApp from './app/init';
import AuthenticatedRoute from './utils/containers/AuthenticatedRoute';

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

// Importing pages
const Login = lazy(() => import('./pages/Login'));
const Layout = lazy(() => import('./containers/Layout'));

// Initializing different libraries
initializeApp();

// Check for login and initialize axios
const token = auth.checkAuth();

function App() {
  useEffect(() => {
    // daisy UI themes initialization
    themeChange(false);
  }, []);

  return (
    <LoadScript googleMapsApiKey="AIzaSyBn8n_poccjk4WVSg31H0rIkU-u7a2lYg8" libraries={['places']}>
      <Router>
        <Routes>
          {/* IMPORTANT! Do not modify the following routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<p>ForgotPassword </p>} />
          <Route path="/register" element={<p>Register </p>} />
          {/* IMPORTANT! Do not modify the above routes */}

          {/* Place new routes over this */}
          {/* VERY IMPORTANT! All new routes should be place bellow /app/... */}
          <Route
            path="/app/*"
            element={
              <AuthenticatedRoute>
                <Layout />
              </AuthenticatedRoute>
            }
          />

          {/* Redirect in case no route matches */}
          {/* Case 1: the token exists then redirect to /app/dashboard */}
          {/* Case 2: the token does not exist, so redirect to /login */}
          <Route path="*" element={<Navigate to={token ? '/app/dashboard' : '/login'} replace />} />
        </Routes>
      </Router>
    </LoadScript>
  );
}

export default App;
