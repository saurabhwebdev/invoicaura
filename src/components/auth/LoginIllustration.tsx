import React from 'react';

const LoginIllustration = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Abstract shapes */}
      <div className="absolute top-16 left-16 w-24 h-24 rounded-full bg-white/10 animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute bottom-32 right-20 w-32 h-32 rounded-full bg-white/10 animate-float" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-1/3 right-24 w-16 h-16 rounded-lg bg-white/10 animate-float" style={{ animationDelay: '1s' }}></div>
      
      {/* Main illustration */}
      <div className="relative z-10 w-[320px]">
        <svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Document icon */}
          <rect x="96" y="48" width="128" height="160" rx="8" fill="white" fillOpacity="0.9" />
          <rect x="112" y="80" width="96" height="8" rx="4" fill="#E0E0FF" />
          <rect x="112" y="96" width="96" height="8" rx="4" fill="#E0E0FF" />
          <rect x="112" y="112" width="64" height="8" rx="4" fill="#E0E0FF" />
          <rect x="112" y="144" width="96" height="8" rx="4" fill="#E0E0FF" />
          <rect x="112" y="160" width="96" height="8" rx="4" fill="#E0E0FF" />
          <rect x="112" y="176" width="64" height="8" rx="4" fill="#E0E0FF" />
          
          {/* Invoice/dollar icon */}
          <circle cx="160" cy="192" r="80" fill="white" fillOpacity="0.15" />
          <circle cx="160" cy="192" r="64" fill="white" fillOpacity="0.2" />
          <path d="M160 160V224" stroke="white" strokeWidth="4" strokeLinecap="round" />
          <path d="M176 168H152C147.582 168 144 171.582 144 176C144 180.418 147.582 184 152 184H168C172.418 184 176 187.582 176 192C176 196.418 172.418 200 168 200H144" stroke="white" strokeWidth="4" strokeLinecap="round" />
          
          {/* Decorative elements */}
          <circle cx="160" cy="120" r="4" fill="white" />
          <circle cx="160" cy="240" r="4" fill="white" />
          <circle cx="240" cy="176" r="4" fill="white" />
          <circle cx="80" cy="176" r="4" fill="white" />
          
          {/* Connection lines */}
          <path d="M160 124L160 156" stroke="white" strokeOpacity="0.5" strokeWidth="2" />
          <path d="M160 208L160 236" stroke="white" strokeOpacity="0.5" strokeWidth="2" />
          <path d="M196 176L236 176" stroke="white" strokeOpacity="0.5" strokeWidth="2" />
          <path d="M124 176L84 176" stroke="white" strokeOpacity="0.5" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
};

export default LoginIllustration; 