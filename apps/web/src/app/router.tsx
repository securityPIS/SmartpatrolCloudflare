import { type ReactNode, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthPage } from "../features/auth/ui/AuthPage";
import { VerifyEmailPage } from "../features/auth/ui/VerifyEmailPage";
import { useAuthStore } from "../features/auth/model/authStore";
import { DashboardPage } from "../features/dashboard/ui/DashboardPage";
import { PatrolPage } from "../features/patrol/ui/PatrolPage";
import { IncidentListPage } from "../features/incident/ui/IncidentListPage";
import { IncidentsLandingPage } from "../features/incident/ui/IncidentsLandingPage";
import { HistoryPage } from "../features/history/ui/HistoryPage";
import { DailyReportPage } from "../features/report/ui/DailyReportPage";
import { NotificationsPage } from "../features/notification/ui/NotificationsPage";
import { ProfilePage } from "../features/profile/ui/ProfilePage";
import { ShipListPage } from "../features/ship/ui/ShipListPage";
import { UserListPage } from "../features/user/ui/UserListPage";
import { PendingRegistrationsPage } from "../features/user/ui/PendingRegistrationsPage";
import { AppLayout } from "../shared/ui/AppLayout";

function LayoutLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b19] text-cyan-500">
      <span className="animate-pulse text-sm font-bold uppercase tracking-widest">Memuat…</span>
    </div>
  );
}

/** Gate that renders the app chrome only for an authenticated session. */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === "unknown") return <LayoutLoading />;
  if (status === "unauthenticated") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <AppLayout>{children}</AppLayout>;
}

/** Restrict a route to one of the allowed roles, redirecting others home. */
function RoleRoute({ children, allow }: { children: ReactNode; allow: ReadonlyArray<string> }) {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === "unknown") return <LayoutLoading />;
  if (status === "unauthenticated") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user && !allow.includes(user.role)) return <Navigate to="/" replace />;
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
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Authenticated (any role) */}
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
          path="/incidents"
          element={
            <ProtectedRoute>
              <IncidentsLandingPage />
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
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin + PIC */}
        <Route
          path="/daily-report"
          element={
            <RoleRoute allow={["ADMIN", "PIC"]}>
              <DailyReportPage />
            </RoleRoute>
          }
        />

        {/* Admin-only */}
        <Route
          path="/ships"
          element={
            <RoleRoute allow={["ADMIN"]}>
              <ShipListPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleRoute allow={["ADMIN"]}>
              <UserListPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/registrations"
          element={
            <RoleRoute allow={["ADMIN"]}>
              <PendingRegistrationsPage />
            </RoleRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
