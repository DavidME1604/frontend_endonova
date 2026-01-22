import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Layout
import Layout from './components/Shared/Layout';

// Dashboard
import Dashboard from './components/Dashboard/Dashboard';

// Patients
import PatientList from './components/Patients/PatientList';
import PatientForm from './components/Patients/PatientForm';
import PatientDetail from './components/Patients/PatientDetail';

// Fichas
import FichaList from './components/Fichas/FichaList';
import FichaForm from './components/Fichas/FichaForm';
import FichaDetail from './components/Fichas/FichaDetail';

// Presupuestos
import PresupuestoList from './components/Presupuestos/PresupuestoList';
import PresupuestoForm from './components/Presupuestos/PresupuestoForm';
import PresupuestoDetail from './components/Presupuestos/PresupuestoDetail';

// Citas
import { CalendarioCitas, AgendaDia } from './components/Citas';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Private Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Patients */}
              <Route path="patients" element={<PatientList />} />
              <Route path="patients/new" element={<PatientForm />} />
              <Route path="patients/:id" element={<PatientDetail />} />
              <Route path="patients/:id/edit" element={<PatientForm />} />

              {/* Fichas */}
              <Route path="fichas" element={<FichaList />} />
              <Route path="fichas/new" element={<FichaForm />} />
              <Route path="fichas/:id" element={<FichaDetail />} />
              <Route path="fichas/:id/edit" element={<FichaForm />} />

              {/* Presupuestos */}
              <Route path="presupuestos" element={<PresupuestoList />} />
              <Route path="presupuestos/nuevo" element={<PresupuestoForm />} />
              <Route path="presupuestos/:id" element={<PresupuestoDetail />} />
              <Route path="presupuestos/:id/editar" element={<PresupuestoForm />} />

              {/* Calendario de Citas */}
              <Route path="calendario" element={<CalendarioCitas />} />
              <Route path="agenda" element={<AgendaDia />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
