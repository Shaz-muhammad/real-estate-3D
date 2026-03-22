import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuth } from "../services/auth.js";

export default function ProtectedRoute({ role, children }) {
  const location = useLocation();
  const auth = getAuth();

  if (!auth.isAuthenticated) {
    const to =
      role === "seller" ? "/login/seller" : role === "admin" ? "/login/admin" : "/login/buyer";
    return <Navigate to={to} replace state={{ from: location.pathname }} />;
  }

  if (role && auth.user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

