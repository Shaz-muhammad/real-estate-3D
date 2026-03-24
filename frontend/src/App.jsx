import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Landing from "./pages/Landing.jsx";
import BuyerLogin from "./pages/BuyerLogin.jsx";
import SellerLogin from "./pages/SellerLogin.jsx";
import Signup from "./pages/Signup.jsx";
import BuyerDashboard from "./pages/BuyerDashboard.jsx";
import SellerDashboard from "./pages/SellerDashboard.jsx";
import PropertyDetails from "./pages/PropertyDetails.jsx";
import NotFound from "./pages/NotFound.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import BuyerLiked from "./pages/BuyerLiked.jsx";
import { getAuth } from "./services/auth.js";

export default function App() {
  const location = useLocation();

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const auth = useMemo(() => getAuth(), [location.pathname, location.key]);

  return (
    <div className="min-h-screen neo-grid text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar theme={theme} setTheme={setTheme} auth={auth} />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Landing />} />

          {/* Auth Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login/buyer" element={<BuyerLogin />} />
          <Route path="/login/seller" element={<SellerLogin />} />
          <Route path="/login/admin" element={<AdminLogin />} />

          {/* Protected Routes */}
          <Route
            path="/buyer"
            element={
              <ProtectedRoute role="buyer">
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller"
            element={
              <ProtectedRoute role="seller">
                <SellerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/buyer/liked"
            element={
              <ProtectedRoute role="buyer">
                <BuyerLiked />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Public */}
          <Route path="/properties/:id" element={<PropertyDetails />} />

          {/* Redirect */}
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}