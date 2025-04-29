import React from 'react';
import LoginForm from '@/components/auth/LoginForm';

const Login = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight aura-text-gradient">
            InvoiceAura
          </h1>
          <p className="text-muted-foreground mt-2">
            Sign in with your Google account
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login; 