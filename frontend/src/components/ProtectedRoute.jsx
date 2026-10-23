import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AccessDenied from '../pages/AccessDenied';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, currentUser } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles required and user doesn't match, show clear Access Denied screen
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    return <AccessDenied requiredRoles={allowedRoles} />;
  }

  return children;
}
