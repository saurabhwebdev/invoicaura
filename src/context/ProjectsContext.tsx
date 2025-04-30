import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { projectService, invoiceService, Project } from '@/lib/dbService';
import { Invoice as ComponentInvoice } from '@/components/InvoiceList';

// Context interface
interface ProjectsContextType {
  projects: Project[];
  invoices: ComponentInvoice[];
  loading: boolean;
  createProject: (projectData: Omit<Project, 'id' | 'invoiced' | 'invoiceCount'>) => Promise<void>;
  updateProject: (projectId: string, projectData: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<ComponentInvoice[]>([]);

  // Helper function to map service Project to component Project
  const mapToComponentProject = (project: any): Project => ({
    id: project.id,
    name: project.name,
    client: project.client,
    budget: project.budget,
    invoiced: project.invoiced,
    startDate: project.startDate,
    endDate: project.endDate,
    status: project.status,
    invoiceCount: project.invoiceCount,
    hardwareBudget: project.hardwareBudget,
    serviceBudget: project.serviceBudget,
    hardwareInvoiced: project.hardwareInvoiced || 0,
    serviceInvoiced: project.serviceInvoiced || 0,
    gstEnabled: project.gstEnabled,
    gstPercentage: project.gstPercentage,
    tdsEnabled: project.tdsEnabled,
    tdsPercentage: project.tdsPercentage,
    poNumbers: project.poNumbers,
    currentPo: project.currentPo,
    activePOs: project.activePOs,
    userId: project.userId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
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
    thirdParty: invoice.thirdParty,
    type: invoice.type
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
  const createProject = async (projectData: Omit<Project, 'id' | 'invoiced' | 'invoiceCount'>) => {
    if (!currentUser) return;

    try {
      // Create project in Firebase
      const newProject = {
        ...projectData,
        invoiced: 0,
        invoiceCount: 0,
        hardwareInvoiced: 0,
        serviceInvoiced: 0
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

  // Update an existing project
  const updateProject = async (projectId: string, projectData: Partial<Project>) => {
    if (!currentUser) return;

    try {
      // Update project in Firebase
      const updatedProject = await projectService.updateProject(currentUser, projectId, projectData);

      // Update local state
      setProjects(prevProjects => 
        prevProjects.map(p => (p.id === projectId ? mapToComponentProject(updatedProject) : p))
      );

      toast({
        title: "Success",
        description: "Project updated successfully"
      });
    } catch (error: any) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update project",
        variant: "destructive"
      });
    }
  };

  // Delete a project
  const deleteProject = async (projectId: string) => {
    if (!currentUser) return;

    try {
      // Check if project has invoices
      const projectInvoices = invoices.filter(invoice => invoice.projectId === projectId);
      if (projectInvoices.length > 0) {
        toast({
          title: "Action Blocked",
          description: "Cannot delete a project with existing invoices. Delete all invoices first.",
          variant: "destructive"
        });
        return;
      }

      // Delete project from Firebase
      await projectService.deleteProject(currentUser, projectId);

      // Update local state
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));

      toast({
        title: "Success",
        description: "Project deleted successfully"
      });
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete project",
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
      const { clientInvoiceId, projectId, company, invoiceNumber, amount, date, description, type } = thirdPartyData;

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

      // Find the client invoice (if provided)
      if (clientInvoiceId) {
        const clientInvoice = invoices.find(i => i.id === clientInvoiceId);
        if (!clientInvoice) {
          toast({
            title: "Error",
            description: "Client invoice not found",
            variant: "destructive"
          });
          return;
        }
      }

      // Create the invoice data
      const invoiceData = {
        projectId,
        projectName: project.name,
        invoiceNumber,
        amount,
        date,
        description,
        status: 'pending' as 'paid' | 'pending' | 'overdue' | 'cancelled',
        type,
        thirdParty: {
          company,
          invoiceNumber,
          amount
        }
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

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        invoices,
        loading,
        createProject,
        updateProject,
        deleteProject,
        createInvoice,
        createThirdPartyInvoice,
        updateInvoiceStatus
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};

export default ProjectsContext; 