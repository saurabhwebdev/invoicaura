import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SignupForm = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const { googleSignIn, currentUser } = useAuth();

  // Clear error if user becomes authenticated
  useEffect(() => {
    if (currentUser) {
      setError('');
      setRedirecting(true);
    }
  }, [currentUser]);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setIsLoading(true);
      console.log("Starting Google sign-up with redirect");
      // This will redirect the user to Google's auth page
      await googleSignIn();
      // Note: The code below won't execute because of the redirect
    } catch (err: any) {
      console.error("Google sign-up error:", err);
      setError(err.message || 'Failed to sign up with Google');
      setIsLoading(false);
    }
  };

  if (redirecting) {
    return (
      <div className="w-full max-w-md mx-auto text-center p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-lg font-medium">Successfully authenticated! Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Sign up to InvoiceAura using your Google account
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
              Signing up...
            </> : 
            <>
              Sign up with Google
            </>
          }
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignupForm; 