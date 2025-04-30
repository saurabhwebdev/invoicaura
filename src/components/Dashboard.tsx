import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import InvoiceList, { Invoice } from './InvoiceList';
import ProjectCard from './ProjectCard';
import ProjectDetail from './ProjectDetail';
import InvoiceDetail from './InvoiceDetail';
import CalendarView from './CalendarView';
import InvoiceForm from './InvoiceForm';
import ThirdPartyInvoiceForm from './ThirdPartyInvoiceForm';
import Budget from './Budget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Calendar, 
  FileText, 
  Receipt, 
  PieChart, 
  TrendingUp,
  CreditCard,
  AlertCircle,
  RefreshCcw
} from "lucide-react";
import { Project } from '@/lib/dbService';

interface DashboardProps {
  projects: Project[];
  invoices: Invoice[];
  onCreateInvoice: (invoice: any) => void;
  onCreateThirdPartyInvoice?: (thirdPartyData: any) => void;
  onUpdateInvoiceStatus?: (invoiceId: string, status: 'paid' | 'pending' | 'overdue') => void;
  onRefreshData?: () => Promise<boolean>;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  projects, 
  invoices,
  onCreateInvoice,
  onCreateThirdPartyInvoice,
  onUpdateInvoiceStatus,
  onRefreshData
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("invoices");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // After initial render, set loaded to true to trigger animations
  useEffect(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 100);
  }, []);
  
  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  const totalInvoiced = projects.reduce((sum, project) => sum + project.invoiced, 0);
  
  // Get active projects
  const activeProjects = projects.filter(project => project.status === 'active');
  
  // Get most recent invoices
  const recentInvoices = [...invoices].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);
  
  // Get pending invoices
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending');
  
  // Get third-party invoices
  const thirdPartyInvoices = invoices.filter(invoice => invoice.thirdParty);
  
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };
  
  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };
  
  const handleCreateInvoiceForProject = () => {
    // This would open the invoice form with the project pre-selected
    toast({
      title: "Create Invoice",
      description: `Creating invoice for ${selectedProject?.name}`,
    });
  };
  
  const handleInvoiceStatusChange = async (invoiceId: string, newStatus: 'paid' | 'pending' | 'overdue') => {
    if (onUpdateInvoiceStatus) {
      try {
        await onUpdateInvoiceStatus(invoiceId, newStatus);
        setSelectedInvoice(null);
        
        toast({
          title: "Invoice Updated",
          description: `Invoice status changed to ${newStatus}`,
        });
      } catch (error) {
        console.error("Error in dashboard when updating invoice status:", error);
        // Toast is already shown by the ProjectsContext
      }
    } else {
      setSelectedInvoice(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefreshData) {
        const success = await onRefreshData();
        if (success) {
          toast({
            title: "Success",
            description: "Data refreshed successfully"
          });
        } else {
          toast({
            title: "Warning",
            description: "Unable to refresh data completely. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        // Fallback to page reload if no refresh handler provided
        window.location.reload();
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 transition-all duration-500 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 aura-text-gradient">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your projects and invoices at a glance
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 w-full sm:w-auto"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <InvoiceForm 
            projects={projects} 
            onSubmit={onCreateInvoice} 
            className="w-full sm:w-auto"
          />
          {onCreateThirdPartyInvoice && (
            <ThirdPartyInvoiceForm
              projects={projects}
              invoices={invoices}
              onSubmit={onCreateThirdPartyInvoice}
              className="w-full sm:w-auto"
            />
          )}
        </div>
      </div>
      
      <div className={`grid gap-5 md:grid-cols-2 lg:grid-cols-4 transition-all duration-500 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
        <Card className="overflow-hidden border-t-4 border-t-aura-blue shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Total Projects</span>
              <div className="p-2 rounded-full bg-blue-50 text-aura-blue">
                <BarChart className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline">
              <div className="text-2xl font-bold">{projects.length}</div>
              {activeProjects.length > 0 && (
                <div className="ml-2 text-xs text-muted-foreground">
                  <span className="text-aura-green font-medium">{activeProjects.length} active</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-t-4 border-t-aura-yellow shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Total Invoices</span>
              <div className="p-2 rounded-full bg-amber-50 text-aura-yellow">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline">
              <div className="text-2xl font-bold">{invoices.length}</div>
              {pendingInvoices.length > 0 && (
                <div className="ml-2 text-xs text-muted-foreground">
                  <span className="text-aura-orange font-medium">
                    {pendingInvoices.length} pending
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Budget 
          totalBudget={totalBudget}
          invoicedAmount={totalInvoiced}
          className="md:col-span-2 shadow-sm hover:shadow-md"
        />
      </div>
      
      <Tabs defaultValue="projects" className={`transition-all duration-500 ease-out rounded-lg bg-card/40 p-4 shadow-sm border ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-background/60 backdrop-blur-sm">
            <TabsTrigger value="projects" className="flex items-center gap-2 text-sm">
              <BarChart className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>
          
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/projects'} className="text-xs">
            View All Projects
          </Button>
        </div>
        
        <TabsContent value="projects" className="mt-2">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeProjects.length > 0 ? (
              activeProjects.slice(0, 3).map((project, index) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onClick={() => handleProjectClick(project)}
                  className="shadow-sm hover:shadow-md"
                />
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center p-8 border border-dashed rounded-lg bg-muted/40">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
                  <p className="text-muted-foreground font-medium">No active projects</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">Create a new project to get started</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-2">
          <CalendarView 
            projects={projects}
            invoices={invoices}
            onProjectSelect={handleProjectClick}
            onInvoiceSelect={handleInvoiceClick}
          />
        </TabsContent>
      </Tabs>
      
      <Tabs defaultValue="invoices" className={`transition-all duration-500 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
        <TabsList className="mb-4 bg-background/60 backdrop-blur-sm">
          <TabsTrigger value="invoices" className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-aura-blue" />
            Client Invoices
          </TabsTrigger>
          <TabsTrigger value="thirdParty" className="flex items-center gap-2 text-sm">
            <Receipt className="h-4 w-4 text-aura-purple" />
            Third-Party Invoices
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices">
          <Card className="border border-aura-blue/20 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-aura-blue">Recent Client Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceList 
                invoices={recentInvoices}
                title=""
                onClick={handleInvoiceClick}
                className="shadow-none"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="thirdParty">
          <Card className="border border-aura-purple/20 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-aura-purple">Third-Party Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceList 
                invoices={thirdPartyInvoices}
                title=""
                onClick={handleInvoiceClick}
                className="shadow-none"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {selectedProject && (
        <ProjectDetail 
          project={selectedProject} 
          invoices={invoices.filter(invoice => invoice.projectId === selectedProject.id)}
          open={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onCreateInvoice={handleCreateInvoiceForProject}
        />
      )}
      
      {selectedInvoice && (
        <InvoiceDetail 
          invoice={selectedInvoice}
          open={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onStatusChange={handleInvoiceStatusChange}
        />
      )}
    </div>
  );
};

export default Dashboard;
