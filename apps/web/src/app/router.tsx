import { type ReactNode, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { LoginPage } from "../features/auth/ui/LoginPage";
import { RegisterPage } from "../features/auth/ui/RegisterPage";
import { VerifyEmailPage } from "../features/auth/ui/VerifyEmailPage";
import { useAuthStore } from "../features/auth/model/authStore";
import { DashboardPage } from "../features/dashboard/ui/DashboardPage";
import { PatrolPage } from "../features/patrol/ui/PatrolPage";
import { ShipListPage } from "../features/ship/ui/ShipListPage";
import { UserListPage } from "../features/user/ui/UserListPage";
import { PendingRegistrationsPage } from "../features/user/ui/PendingRegistrationsPage";
import { AppLayout } from "../shared/ui/AppLayout";
import { IncidentListPage } from "../features/incident/ui/IncidentListPage";

function LayoutLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b19] text-cyan-500">
      <span className="animate-pulse text-sm font-bold uppercase tracking-widest">Memuat…</span>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === "unknown") {
    return <LayoutLoading />;
  }
  if (status === "unauthenticated") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <AppLayout>{children}</AppLayout>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === "unknown") {
    return <LayoutLoading />;
  }
  if (status === "unauthenticated") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user && user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }
  return <AppLayout>{children}</AppLayout>;
}

export function AppRouter() {
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Authenticated */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patrol/:shipId"
          element={
            <ProtectedRoute>
              <PatrolPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents/:shipId"
          element={
            <ProtectedRoute>
              <IncidentListPage />
            </ProtectedRoute>
          }
        />

        {/* Admin-only */}
        <Route
          path="/ships"
          element={
            <AdminRoute>
              <ShipListPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UserListPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/registrations"
          element={
            <AdminRoute>
              <PendingRegistrationsPage />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
