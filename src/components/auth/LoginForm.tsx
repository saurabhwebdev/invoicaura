import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, LogIn } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { googleSignIn, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if user becomes authenticated
  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setIsLoading(true);
      console.log("Starting Google sign-in with popup");
      await googleSignIn();
      // The redirect will be handled by the googleSignIn function or the useEffect above
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(err.message || 'Failed to log in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>
          Sign in to your InvoiceAura account using Google
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Button 
          variant="default" 
          className="w-full flex items-center justify-center gap-2" 
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? 
            <>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
              Signing in...
            </> : 
            <>
              <LogIn className="h-4 w-4" />
              Sign in with Google
            </>
          }
        </Button>
      </CardContent>
    </Card>
  );
};

export default LoginForm; 