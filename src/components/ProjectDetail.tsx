import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, X, Plus, Clock } from "lucide-react";
import { cn } from '@/lib/utils';
import { Project } from './ProjectCard';
import InvoiceList, { Invoice } from './InvoiceList';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InvoiceForm from './InvoiceForm';
import { useProjects } from '@/context/ProjectsContext';
import { useSettings } from '@/context/SettingsContext';

interface ProjectDetailProps {
  project: Project;
  invoices: Invoice[];
  open: boolean;
  onClose: () => void;
  onCreateInvoice?: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ 
  project, 
  invoices, 
  open, 
  onClose,
  onCreateInvoice
}) => {
  const { createInvoice } = useProjects();
  const { formatCurrency, formatDate } = useSettings();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  // Filter invoices for this project
  const projectInvoices = invoices.filter(invoice => invoice.projectId === project.id);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-aura-green/10 text-aura-green hover:bg-aura-green/20';
      case 'completed':
        return 'bg-aura-blue/10 text-aura-blue hover:bg-aura-blue/20';
      case 'pending':
        return 'bg-aura-orange/10 text-aura-orange hover:bg-aura-orange/20';
      default:
        return 'bg-aura-gray/10 text-aura-gray hover:bg-aura-gray/20';
    }
  };
  
  const progress = Math.min((project.invoiced / project.budget) * 100, 100);
  const daysLeft = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  
  const handleCreateInvoice = (invoiceData: any) => {
    // Make sure the project is correct
    const newInvoice = {
      ...invoiceData,
      projectId: project.id
    };
    createInvoice(newInvoice);
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl">{project.name}</DialogTitle>
            <Badge className={cn("ml-2 capitalize", getStatusColor(project.status))}>
              {project.status}
            </Badge>
          </div>
          <CardDescription className="text-base">{project.client}</CardDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(project.budget)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Invoiced</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(project.invoiced)}</div>
                <Progress 
                  value={progress} 
                  className={cn(
                    "h-1.5 mt-2",
                    progress > 90 ? "text-aura-red" : 
                    progress > 75 ? "text-aura-orange" : 
                    "text-aura-green"
                  )}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center text-sm gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Start Date:</span>
                <span>{formatDate(project.startDate)}</span>
              </div>
              <div className="flex items-center text-sm gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">End Date:</span>
                <span>{formatDate(project.endDate)}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center text-sm gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Invoice Count:</span>
                <span>{project.invoiceCount}</span>
              </div>
              {project.status !== 'completed' && (
                <div className="flex items-center text-sm gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Days Left:</span>
                  <span>{daysLeft > 0 ? daysLeft : 'Overdue'}</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Project Invoices</h3>
              <InvoiceForm 
                projects={[project]} 
                onSubmit={handleCreateInvoice} 
                className="w-auto"
                selectedProjectId={project.id}
                hideProjectSelection={true}
              />
            </div>
            
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                {projectInvoices.length > 0 ? (
                  <InvoiceList 
                    invoices={projectInvoices} 
                    title="" 
                    onClick={() => {}}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No invoices for this project yet.
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="pending" className="mt-4">
                {projectInvoices.filter(i => i.status === 'pending').length > 0 ? (
                  <InvoiceList 
                    invoices={projectInvoices.filter(i => i.status === 'pending')} 
                    title="" 
                    onClick={() => {}}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending invoices.
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="paid" className="mt-4">
                {projectInvoices.filter(i => i.status === 'paid').length > 0 ? (
                  <InvoiceList 
                    invoices={projectInvoices.filter(i => i.status === 'paid')} 
                    title="" 
                    onClick={() => {}}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No paid invoices.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetail; 