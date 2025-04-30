import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProjectsProvider } from "@/context/ProjectsContext";
import { SettingsProvider } from "@/context/SettingsContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";

// Main App Pages
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import Vendors from "./pages/Vendors";
import Invoices from "./pages/Invoices";
import ThirdParty from "./pages/ThirdParty";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";

// Auth Pages
import Login from "./pages/Login";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="app-container">
          <Toaster />
          <Sonner richColors position="top-right" />
          <BrowserRouter>
            <AuthProvider>
              <SettingsProvider>
                <ProjectsProvider>
                  <Routes>
                    {/* Protected Routes */}
                    <Route 
                      path="/" 
                      element={
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/projects" 
                      element={
                        <ProtectedRoute>
                          <Projects />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/vendors" 
                      element={
                        <ProtectedRoute>
                          <Vendors />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/invoices" 
                      element={
                        <ProtectedRoute>
                          <Invoices />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/third-party" 
                      element={
                        <ProtectedRoute>
                          <ThirdParty />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/settings" 
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Public Routes */}
                    <Route 
                      path="/login" 
                      element={
                        <PublicRoute>
                          <Login />
                        </PublicRoute>
                      } 
                    />
                    
                    {/* Redirects for old auth routes */}
                    <Route path="/signup" element={<Navigate to="/login" replace />} />
                    <Route path="/forgot-password" element={<Navigate to="/login" replace />} />

                    {/* Other Routes */}
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Routes>
                </ProjectsProvider>
              </SettingsProvider>
            </AuthProvider>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
