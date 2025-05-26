// src/App.jsx
import React, { useContext } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './components/Home';
import Registro from './components/Register';
import Login from './components/Login';
import PrincipalPage from './components/PrincipalPage';
import { AuthContext } from './contexts/AuthContext';

function PrivateRoute({ children }) {
  const { token } = useContext(AuthContext);
  return token
    ? children
    : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { token } = useContext(AuthContext);
  return !token
    ? children
    : <Navigate to="/principal" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* 1. Home público */}
        <Route path="/" element={<Home />} />

        {/* 2. Registro y login solo para no autenticados */}
        <Route
          path="/registro"
          element={
            <PublicRoute>
              <Registro />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* 3. PrincipalPage: ruta privada */}
        <Route
          path="/principal"
          element={
            <PrivateRoute>
              <PrincipalPage />
            </PrivateRoute>
          }
        />

        {/* 4. Cualquier otra ruta → Home público */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
