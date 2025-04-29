import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { currentUser, loading } = useAuth();

  // While authentication state is being determined, show loading spinner
  if (loading) {
    return <LoadingSpinner />;
  }

  // If already authenticated, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  // If not authenticated, render the auth page
  return <>{children}</>;
};

export default PublicRoute; 