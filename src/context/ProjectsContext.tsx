import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { projectService, invoiceService } from '@/lib/dbService';
import { Project as ComponentProject } from '@/components/ProjectCard';
import { Invoice as ComponentInvoice } from '@/components/InvoiceList';

// Context interface
interface ProjectsContextType {
  projects: ComponentProject[];
  invoices: ComponentInvoice[];
  loading: boolean;
  createProject: (projectData: Omit<ComponentProject, 'id' | 'invoiced' | 'invoiceCount'>) => Promise<void>;
  createInvoice: (invoiceData: any) => Promise<void>;
  createThirdPartyInvoice: (thirdPartyData: any) => Promise<void>;
  updateInvoiceStatus: (invoiceId: string, status: 'paid' | 'pending' | 'overdue') => Promise<void>;
}

// Context with default undefined value
const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

// Custom hook to use the context
export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};

// Provider component
export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ComponentProject[]>([]);
  const [invoices, setInvoices] = useState<ComponentInvoice[]>([]);

  // Helper function to map service Project to component Project
  const mapToComponentProject = (project: any): ComponentProject => ({
    id: project.id,
    name: project.name,
    client: project.client,
    budget: project.budget,
    invoiced: project.invoiced,
    startDate: project.startDate,
    endDate: project.endDate,
    status: project.status === 'cancelled' ? 'pending' : project.status, // Map cancelled to pending for component
    invoiceCount: project.invoiceCount
  });

  // Helper function to map service Invoice to component Invoice
  const mapToComponentInvoice = (invoice: any): ComponentInvoice => ({
    id: invoice.id,
    projectId: invoice.projectId,
    projectName: invoice.projectName,
    invoiceNumber: invoice.invoiceNumber,
    amount: invoice.amount,
    date: invoice.date,
    description: invoice.description,
    status: invoice.status === 'cancelled' ? 'pending' : invoice.status, // Map cancelled to pending for component
    thirdParty: invoice.thirdParty
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;

      setLoading(true);
      try {
        // Load projects
        const userProjects = await projectService.getProjects(currentUser);
        setProjects(userProjects.map(mapToComponentProject));

        // Load invoices
        const userInvoices = await invoiceService.getInvoices(currentUser);
        setInvoices(userInvoices.map(mapToComponentInvoice));
      } catch (error: any) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, toast]);

  // Create a new project
  const createProject = async (projectData: Omit<ComponentProject, 'id' | 'invoiced' | 'invoiceCount'>) => {
    if (!currentUser) return;

    try {
      // Create project in Firebase
      const newProject = {
        ...projectData,
        invoiced: 0,
        invoiceCount: 0
      };

      const createdProject = await projectService.createProject(currentUser, newProject);

      // Update local state
      setProjects(prevProjects => [...prevProjects, mapToComponentProject(createdProject)]);

      toast({
        title: "Success",
        description: "Project created successfully"
      });
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive"
      });
    }
  };

  // Create a new invoice
  const createInvoice = async (newInvoice: any) => {
    if (!currentUser) return;

    try {
      // Find the corresponding project
      const project = projects.find(p => p.id === newInvoice.projectId);
      if (!project) {
        toast({
          title: "Error",
          description: "Project not found",
          variant: "destructive"
        });
        return;
      }

      // Add project name to invoice
      const invoiceData = {
        ...newInvoice,
        projectName: project.name
      };

      // Create the invoice in Firebase
      const createdInvoice = await invoiceService.createInvoice(
        currentUser,
        invoiceData
      );

      // Update local state
      setInvoices(prevInvoices => [...prevInvoices, mapToComponentInvoice(createdInvoice)]);

      // Update local project state
      const updatedProject = await projectService.getProject(currentUser, project.id);
      setProjects(prevProjects =>
        prevProjects.map(p => (p.id === updatedProject.id ? mapToComponentProject(updatedProject) : p))
      );

      toast({
        title: "Success",
        description: "Invoice created successfully"
      });
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive"
      });
    }
  };

  // Create a third-party invoice
  const createThirdPartyInvoice = async (thirdPartyData: any) => {
    if (!currentUser) return;

    try {
      const { clientInvoiceId, projectId, company, invoiceNumber, amount, date, description } = thirdPartyData;

      // Find the project
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        toast({
          title: "Error",
          description: "Project not found",
          variant: "destructive"
        });
        return;
      }

      // Find the client invoice
      const clientInvoice = invoices.find(i => i.id === clientInvoiceId);
      if (!clientInvoice) {
        toast({
          title: "Error",
          description: "Client invoice not found",
          variant: "destructive"
        });
        return;
      }

      // Create the third-party invoice
      const thirdPartyInvoice = {
        projectId,
        projectName: project.name,
        invoiceNumber: `TP-${invoiceNumber}`,
        amount,
        date,
        description,
        status: 'pending' as const,
        thirdParty: {
          company,
          invoiceNumber,
          amount
        }
      };

      // Save to Firebase
      const createdInvoice = await invoiceService.createInvoice(
        currentUser,
        thirdPartyInvoice
      );

      // Update local state
      setInvoices(prevInvoices => [...prevInvoices, mapToComponentInvoice(createdInvoice)]);

      // Update the project
      const updatedProject = await projectService.getProject(currentUser, project.id);
      setProjects(prevProjects =>
        prevProjects.map(p => (p.id === updatedProject.id ? mapToComponentProject(updatedProject) : p))
      );

      toast({
        title: "Success",
        description: "Third-party invoice created successfully"
      });
    } catch (error: any) {
      console.error("Error creating third-party invoice:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create third-party invoice",
        variant: "destructive"
      });
    }
  };

  // Update invoice status
  const updateInvoiceStatus = async (invoiceId: string, status: 'paid' | 'pending' | 'overdue') => {
    if (!currentUser) return;

    try {
      // Find the invoice
      const invoice = invoices.find(i => i.id === invoiceId);
      if (!invoice) {
        toast({
          title: "Error",
          description: "Invoice not found",
          variant: "destructive"
        });
        return;
      }

      // Update the invoice in Firebase
      const updatedInvoice = await invoiceService.updateInvoice(
        currentUser,
        invoiceId,
        { status }
      );

      // Update local state
      setInvoices(prevInvoices =>
        prevInvoices.map(i => (i.id === invoiceId ? mapToComponentInvoice(updatedInvoice) : i))
      );

      toast({
        title: "Success",
        description: `Invoice status updated to ${status}`
      });
    } catch (error: any) {
      console.error("Error updating invoice status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update invoice status",
        variant: "destructive"
      });
    }
  };

  // Create sample data
  const createSampleData = async () => {
    if (!currentUser || projects.length > 0 || loading) return;

    try {
      // Sample projects
      const sampleProjects = [
        {
          name: "Website Redesign",
          client: "Acme Corporation",
          budget: 12000,
          invoiced: 0,
          startDate: "2025-02-15",
          endDate: "2025-06-30",
          status: 'active' as const,
          invoiceCount: 0
        },
        {
          name: "Mobile App Development",
          client: "Global Industries",
          budget: 35000,
          invoiced: 0,
          startDate: "2025-01-10",
          endDate: "2025-08-15",
          status: 'active' as const,
          invoiceCount: 0
        },
        {
          name: "Marketing Campaign",
          client: "Tech Innovators",
          budget: 8500,
          invoiced: 0,
          startDate: "2024-11-05",
          endDate: "2025-03-01",
          status: 'active' as const,
          invoiceCount: 0
        }
      ];

      // Create projects
      const createdProjects = [];
      for (const project of sampleProjects) {
        const created = await projectService.createProject(currentUser, project);
        createdProjects.push(created);
      }

      // Set projects state
      setProjects(createdProjects.map(mapToComponentProject));

      // Create a sample invoice for each project
      const sampleInvoices = [];
      for (let i = 0; i < createdProjects.length; i++) {
        const project = createdProjects[i];
        const invoice = {
          projectId: project.id,
          projectName: project.name,
          invoiceNumber: `INV-00${i + 1}`,
          amount: Math.round(project.budget * 0.3),
          date: new Date().toISOString().split('T')[0],
          description: "Initial payment",
          status: 'pending' as const
        };

        const created = await invoiceService.createInvoice(currentUser, invoice);
        sampleInvoices.push(created);
      }

      // Update projects
      const updatedProjects = await projectService.getProjects(currentUser);
      setProjects(updatedProjects.map(mapToComponentProject));

      // Set invoices state
      setInvoices(sampleInvoices.map(mapToComponentInvoice));

      toast({
        title: "Sample Data Created",
        description: "Sample projects and invoices have been created for you."
      });
    } catch (error: any) {
      console.error("Error creating sample data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create sample data",
        variant: "destructive"
      });
    }
  };

  // Check if we need to create sample data
  useEffect(() => {
    if (!loading && projects.length === 0 && currentUser) {
      createSampleData();
    }
  }, [loading, projects.length, currentUser]);

  // Context value
  const value = {
    projects,
    invoices,
    loading,
    createProject,
    createInvoice,
    createThirdPartyInvoice,
    updateInvoiceStatus
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};

export default ProjectsContext; 