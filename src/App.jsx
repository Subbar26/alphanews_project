import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";

import Navbar from "./components/Navbar";
import AllCommunitiesPage from "./components/AllCommunitiesPage";
import MyCommunitiesPage from "./components/MyCommunitiesPage";
import Login from "./components/Login";
import Register from "./components/Register";
import User from "./components/UserProfile";
import GeneralNotices from "./components/GeneralNotices";
import CommunityNotices from "./components/CommunityNotices";

function PrivateRoute({ children }) {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { token } = useContext(AuthContext);
  // si ya estás logueado, te mando a "/"
  return !token ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          {/* 1. "/" → todas las comunidades, siempre */}
          <Route path="/" element={<AllCommunitiesPage />} />

          {/* 2. Registro / Login solo para no autenticados */}
          <Route
            path="/registro"
            element={<PublicRoute><Register /></PublicRoute>}
          />
          <Route
            path="/login"
            element={<PublicRoute><Login /></PublicRoute>}
          />

          {/* 3. "/comunidades" → Mis Comunidades, solo autenticados */}
          <Route
            path="/comunidades"
            element={<PrivateRoute><MyCommunitiesPage /></PrivateRoute>}
          />
          <Route
            path="/usuario"
            element={<PrivateRoute><User /></PrivateRoute>}
          />
          <Route
            path="/noticias"
            element={<PrivateRoute><GeneralNotices /></PrivateRoute>}
          />

          {/* aquí la ruta que faltaba */}
          <Route
            path="/comunidades/:communityId/noticias"
            element={
              <PrivateRoute>
                <CommunityNotices />
              </PrivateRoute>
            }
          />


        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
