import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  onAuthStateChanged, 
  signOut, 
  signInWithGoogle
} from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';

// Define the shape of our auth context
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  googleSignIn: () => Promise<any>;
  logOut: () => Promise<void>;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Log out function
  const logOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Google sign in function
  const googleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      console.log("Google sign-in successful:", result);
      if (result.user) {
        navigate('/', { replace: true });
      }
      return result;
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  // Effect to redirect authenticated users away from auth pages
  useEffect(() => {
    if (!loading && currentUser && (location.pathname === '/login' || location.pathname === '/signup')) {
      console.log("Redirecting authenticated user to home");
      navigate('/', { replace: true });
    }
  }, [currentUser, loading, location.pathname, navigate]);

  // Effect to listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user");
      setCurrentUser(user);
      setLoading(false);
      
      // If user is logged in and on an auth page, redirect to home
      if (user && (location.pathname === '/login' || location.pathname === '/signup')) {
        console.log("Redirecting to home from auth listener");
        navigate('/', { replace: true });
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [navigate, location.pathname]);

  // Create the value object for the context
  const value = {
    currentUser,
    loading,
    googleSignIn,
    logOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading authentication...</div>}
    </AuthContext.Provider>
  );
};

export default AuthContext; 