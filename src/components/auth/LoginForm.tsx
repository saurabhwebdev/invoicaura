import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    <Card className="w-full shadow-lg animate-fade-in border-0 bg-white/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="w-full flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full aura-gradient flex items-center justify-center">
            <LogIn className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="animate-shake">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="text-center text-sm text-muted-foreground mb-2">
          Continue with your Google account for secure access
        </div>
        
        <Button 
          variant="default" 
          className="w-full flex items-center justify-center gap-2 rounded-full py-6 aura-gradient hover:opacity-90 transition-opacity"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? 
            <>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
              Signing in...
            </> : 
            <>
              <GoogleIcon className="h-5 w-5" />
              Sign in with Google
            </>
          }
        </Button>
        
        <div className="text-center text-sm text-muted-foreground mt-4">
          By signing in, you agree to our <span className="text-primary hover:underline cursor-pointer">Terms of Service</span> and <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
        </div>
      </CardContent>
    </Card>
  );
};

// Google icon component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z" />
    <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970142 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" />
    <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z" />
    <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z" />
  </svg>
);

export default LoginForm; 