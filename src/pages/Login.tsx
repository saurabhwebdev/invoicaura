import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import LoginIllustration from '@/components/auth/LoginIllustration';

const Login = () => {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Information */}
      <div className="hidden md:flex md:w-1/2 aura-gradient items-center justify-center p-8 relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-[10%] left-[10%] w-40 h-40 rounded-full border border-white/20"></div>
          <div className="absolute bottom-[15%] right-[5%] w-60 h-60 rounded-full border border-white/20"></div>
          <div className="absolute top-[40%] right-[20%] w-20 h-20 rounded-full border border-white/20"></div>
        </div>
        
        <div className="relative z-10 max-w-lg text-white">
          <div className="mb-12">
            <LoginIllustration />
          </div>
          
          <h1 className="text-4xl font-bold mb-6">InvoiceAura</h1>
          <p className="text-xl mb-8">Streamline your invoicing process with our powerful and intuitive platform.</p>
          
          <div className="space-y-6">
            <FeatureItem 
              icon={<DocumentIcon />} 
              title="Easy Invoicing" 
              description="Create and manage professional invoices in seconds"
            />
            <FeatureItem 
              icon={<ChartIcon />} 
              title="Financial Insights" 
              description="Track payments and get detailed financial reports"
            />
            <FeatureItem 
              icon={<ConnectionIcon />} 
              title="Client Management" 
              description="Manage your clients and projects efficiently"
            />
          </div>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight aura-text-gradient">
              InvoiceAura
            </h1>
            <p className="text-muted-foreground mt-2">
              Sign in to your account
            </p>
          </div>
          <LoginForm />
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Need help? <span className="text-primary cursor-pointer hover:underline">Contact support</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple icons for features
const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
    <line x1="2" y1="20" x2="22" y2="20"></line>
  </svg>
);

const ConnectionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"></path>
    <rect x="3" y="4" width="18" height="18" rx="2"></rect>
    <circle cx="12" cy="10" r="2"></circle>
  </svg>
);

// Feature item component
const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="flex items-start">
    <div className="mr-4 p-2 bg-white/10 rounded-lg text-white">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-white/80">{description}</p>
    </div>
  </div>
);

export default Login; 