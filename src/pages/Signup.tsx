import React from 'react';
import SignupForm from '@/components/auth/SignupForm';

const Signup = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight aura-text-gradient">
            InvoiceAura
          </h1>
          <p className="text-muted-foreground mt-2">
            Create a new account
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
};

export default Signup; 