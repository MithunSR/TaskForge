import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AdminRoute() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'Admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}