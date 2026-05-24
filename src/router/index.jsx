import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Auth pages
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';
import AdminLoginPage from '../features/auth/pages/AdminLoginPage';
import CompleteProfilePage from '../features/auth/pages/CompleteProfilePage';

// User pages
import DashboardPage from '../features/user/pages/DashboardPage';
import AttendancePage from '../features/user/pages/AttendancePage';
import PointsPage from '../features/user/pages/PointsPage';
import ProfilePage from '../features/user/pages/ProfilePage';

// Admin pages
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage';
import AdminAttendancesPage from '../features/admin/pages/AdminAttendancesPage';
import AdminRedemptionsPage from '../features/admin/pages/AdminRedemptionsPage';
import AdminUsersPage from '../features/admin/pages/AdminUsersPage';
import AdminQRPage from '../features/admin/pages/AdminQRPage';

// Layouts
import UserLayout from '../components/layouts/UserLayout';
import AdminLayout from '../components/layouts/AdminLayout';

/* ── Route guards ────────────────────────────────────── */
function RequireAuth({ children }) {
  const { accessToken, user } = useAuthStore();
  if (!accessToken) return <Navigate to="/login" replace />;
  // Admin jangan masuk ke route user kecuali complete-profile
  if (
    user?.role === 'admin' &&
    window.location.pathname !== '/complete-profile'
  ) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
}

function RequireAdmin({ children }) {
  const { accessToken, user } = useAuthStore();
  if (!accessToken) return <Navigate to="/admin/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { accessToken, user, needsProfileCompletion } = useAuthStore();
  if (accessToken) {
    // User baru register Google belum lengkapi profil — arahkan ke /complete-profile
    if (needsProfileCompletion)
      return <Navigate to="/complete-profile" replace />;
    return (
      <Navigate
        to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
        replace
      />
    );
  }
  return children;
}

/* ── Router ──────────────────────────────────────────── */
export default function AppRouter() {
  return (
    <Routes>
      {/* Public / guest only */}
      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestOnly>
            <ForgotPasswordPage />
          </GuestOnly>
        }
      />
      <Route
        path="/reset-password"
        element={
          <GuestOnly>
            <ResetPasswordPage />
          </GuestOnly>
        }
      />
      <Route
        path="/admin/login"
        element={
          <GuestOnly>
            <AdminLoginPage />
          </GuestOnly>
        }
      />

      {/* Lengkapi profil setelah register Google — butuh auth, tapi bukan GuestOnly */}
      <Route
        path="/complete-profile"
        element={
          <RequireAuth>
            <CompleteProfilePage />
          </RequireAuth>
        }
      />

      {/* User routes */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <UserLayout>
              <DashboardPage />
            </UserLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/attendance"
        element={
          <RequireAuth>
            <UserLayout>
              <AttendancePage />
            </UserLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/points"
        element={
          <RequireAuth>
            <UserLayout>
              <PointsPage />
            </UserLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <UserLayout>
              <ProfilePage />
            </UserLayout>
          </RequireAuth>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <RequireAdmin>
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/attendances"
        element={
          <RequireAdmin>
            <AdminLayout>
              <AdminAttendancesPage />
            </AdminLayout>
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/redemptions"
        element={
          <RequireAdmin>
            <AdminLayout>
              <AdminRedemptionsPage />
            </AdminLayout>
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireAdmin>
            <AdminLayout>
              <AdminUsersPage />
            </AdminLayout>
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/qr"
        element={
          <RequireAdmin>
            <AdminLayout>
              <AdminQRPage />
            </AdminLayout>
          </RequireAdmin>
        }
      />

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  const { accessToken, user } = useAuthStore();
  const home = accessToken
    ? user?.role === 'admin'
      ? '/admin/dashboard'
      : '/dashboard'
    : '/login';

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center text-center p-6">
      <p className="font-mono text-stone-300 text-5xl mb-4">404</p>
      <h1 className="font-display text-2xl text-ink mb-2">
        Halaman tidak ditemukan
      </h1>
      <p className="text-stone-500 text-sm mb-6">
        Halaman yang Anda cari tidak tersedia.
      </p>
      <a href={home} className="btn btn-primary">
        Kembali ke Beranda
      </a>
    </div>
  );
}
