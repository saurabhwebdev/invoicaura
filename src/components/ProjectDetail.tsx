import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, X, Plus, Clock, HardDrive, Wrench, Pencil } from "lucide-react";
import { cn } from '@/lib/utils';
import { Project } from './ProjectCard';
import InvoiceList, { Invoice } from './InvoiceList';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import InvoiceForm from './InvoiceForm';
import { useProjects } from '@/context/ProjectsContext';
import { useSettings } from '@/context/SettingsContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

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
  const { createInvoice, updateProject } = useProjects();
  const { formatCurrency, formatDate } = useSettings();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: project.name,
    client: project.client,
    status: project.status,
    budget: project.budget,
    startDate: project.startDate,
    endDate: project.endDate,
    splitBudget: project.hardwareBudget !== undefined,
    hardwareBudget: project.hardwareBudget || 0,
    serviceBudget: project.serviceBudget || 0
  });
  
  // Filter invoices for this project
  const projectInvoices = invoices.filter(invoice => invoice.projectId === project.id);
  
  // Check if project has hardware/service budget split
  const hasBudgetSplit = project.hardwareBudget !== undefined && project.serviceBudget !== undefined;
  
  // Filter hardware and service invoices if project has split budget
  const hardwareInvoices = hasBudgetSplit ? projectInvoices.filter(invoice => invoice.type === 'hardware') : [];
  const serviceInvoices = hasBudgetSplit ? projectInvoices.filter(invoice => invoice.type === 'service') : [];
  
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
  
  // Calculate hardware and service progress if available
  const hardwareProgress = hasBudgetSplit && project.hardwareBudget ? 
    Math.min(((project.hardwareInvoiced || 0) / project.hardwareBudget) * 100, 100) : 0;
  
  const serviceProgress = hasBudgetSplit && project.serviceBudget ? 
    Math.min(((project.serviceInvoiced || 0) / project.serviceBudget) * 100, 100) : 0;
  
  const daysLeft = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  
  const handleCreateInvoice = (invoiceData: any) => {
    // Make sure the project is correct
    const newInvoice = {
      ...invoiceData,
      projectId: project.id
    };
    createInvoice(newInvoice);
  };
  
  const handleEditProject = () => {
    setEditFormData({
      name: project.name,
      client: project.client,
      status: project.status,
      budget: project.budget,
      startDate: project.startDate,
      endDate: project.endDate,
      splitBudget: project.hardwareBudget !== undefined,
      hardwareBudget: project.hardwareBudget || 0,
      serviceBudget: project.serviceBudget || 0
    });
    setShowEditModal(true);
  };
  
  const handleSubmitEdit = () => {
    // Validation
    if (!editFormData.name || !editFormData.client || !editFormData.startDate || !editFormData.endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate budget
    if (!editFormData.splitBudget && !editFormData.budget) {
      toast({
        title: "Missing Budget",
        description: "Please enter a total budget for the project.",
        variant: "destructive"
      });
      return;
    }
    
    if (editFormData.splitBudget && (!editFormData.hardwareBudget || !editFormData.serviceBudget)) {
      toast({
        title: "Missing Budget Details",
        description: "Please enter both hardware and service budgets.",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate the total budget when split
    const totalBudget = editFormData.splitBudget 
      ? Number(editFormData.hardwareBudget) + Number(editFormData.serviceBudget)
      : Number(editFormData.budget);
    
    // Update project
    const updatedProject = {
      name: editFormData.name,
      client: editFormData.client,
      status: editFormData.status,
      budget: totalBudget,
      startDate: editFormData.startDate,
      endDate: editFormData.endDate,
      ...(editFormData.splitBudget && {
        hardwareBudget: Number(editFormData.hardwareBudget),
        serviceBudget: Number(editFormData.serviceBudget)
      })
    };
    
    updateProject(project.id, updatedProject);
    setShowEditModal(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl">{project.name}</DialogTitle>
            <div className="flex items-center gap-2">
              <Badge className={cn("capitalize", getStatusColor(project.status))}>
                {project.status}
              </Badge>
              <Button variant="ghost" size="icon" onClick={handleEditProject}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-base">{project.client}</CardDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Without split budget */}
          {!hasBudgetSplit && (
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-aura-blue/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(project.budget)}</div>
                </CardContent>
              </Card>
              
              <Card className="border-aura-blue/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Invoiced</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(project.invoiced)}</div>
                  <Progress 
                    value={progress} 
                    className={cn(
                      "h-1.5 mt-2",
                      progress > 90 ? "bg-aura-red" : 
                      progress > 75 ? "bg-aura-orange" : 
                      "bg-aura-green"
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* With split budget */}
          {hasBudgetSplit && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-aura-blue/20">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <HardDrive className="h-4 w-4 text-aura-blue" />
                      Hardware Budget
                    </CardTitle>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-aura-blue/10 text-aura-blue">
                      {Math.round(hardwareProgress)}% Used
                    </span>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="text-xl font-bold">{formatCurrency(project.hardwareBudget || 0)}</div>
                    <div className="flex justify-between text-sm mt-1 mb-2">
                      <span className="text-muted-foreground">Invoiced</span>
                      <span>{formatCurrency(project.hardwareInvoiced || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-medium">{formatCurrency((project.hardwareBudget || 0) - (project.hardwareInvoiced || 0))}</span>
                    </div>
                    <Progress 
                      value={hardwareProgress} 
                      className={cn(
                        "h-1.5 mt-1",
                        hardwareProgress > 90 ? "bg-aura-red" : 
                        hardwareProgress > 75 ? "bg-aura-orange" : 
                        "bg-aura-blue"
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Card className="border-aura-purple/20">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <Wrench className="h-4 w-4 text-aura-purple" />
                      Service Budget
                    </CardTitle>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-aura-purple/10 text-aura-purple">
                      {Math.round(serviceProgress)}% Used
                    </span>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="text-xl font-bold">{formatCurrency(project.serviceBudget || 0)}</div>
                    <div className="flex justify-between text-sm mt-1 mb-2">
                      <span className="text-muted-foreground">Invoiced</span>
                      <span>{formatCurrency(project.serviceInvoiced || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-medium">{formatCurrency((project.serviceBudget || 0) - (project.serviceInvoiced || 0))}</span>
                    </div>
                    <Progress 
                      value={serviceProgress} 
                      className={cn(
                        "h-1.5 mt-1",
                        serviceProgress > 90 ? "bg-aura-red" : 
                        serviceProgress > 75 ? "bg-aura-orange" : 
                        "bg-aura-purple"
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
              
              <Card className="border-aura-gray/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget Summary</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Total Budget</span>
                      <div className="text-xl font-bold">{formatCurrency(project.budget)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Total Invoiced</span>
                      <div className="text-xl font-bold">{formatCurrency(project.invoiced)}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Overall Progress</span>
                      <span className="text-sm font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress 
                      value={progress} 
                      className={cn(
                        "h-2",
                        progress > 90 ? "bg-aura-red" : 
                        progress > 75 ? "bg-aura-orange" : 
                        "bg-aura-green"
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center text-sm gap-2">
                <Calendar className="h-4 w-4 text-aura-blue" />
                <span className="font-medium">Start Date:</span>
                <span>{formatDate(project.startDate)}</span>
              </div>
              <div className="flex items-center text-sm gap-2">
                <Calendar className="h-4 w-4 text-aura-blue" />
                <span className="font-medium">End Date:</span>
                <span>{formatDate(project.endDate)}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center text-sm gap-2">
                <CreditCard className="h-4 w-4 text-aura-purple" />
                <span className="font-medium">Invoice Count:</span>
                <span>{project.invoiceCount}</span>
              </div>
              {project.status !== 'completed' && (
                <div className="flex items-center text-sm gap-2">
                  <Clock className="h-4 w-4 text-aura-orange" />
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
                onSubmit={(data) => {
                  handleCreateInvoice(data);
                  setShowInvoiceModal(false);
                }}
                selectedProjectId={project.id}
              />
            </div>
            
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                {hasBudgetSplit && (
                  <>
                    <TabsTrigger value="hardware" className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      Hardware
                    </TabsTrigger>
                    <TabsTrigger value="service" className="flex items-center gap-1">
                      <Wrench className="h-3 w-3" />
                      Service
                    </TabsTrigger>
                  </>
                )}
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
              
              {hasBudgetSplit && (
                <>
                  <TabsContent value="hardware" className="mt-4">
                    {hardwareInvoices.length > 0 ? (
                      <InvoiceList 
                        invoices={hardwareInvoices} 
                        title="" 
                        onClick={() => {}}
                      />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No hardware invoices for this project yet.
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="service" className="mt-4">
                    {serviceInvoices.length > 0 ? (
                      <InvoiceList 
                        invoices={serviceInvoices} 
                        title="" 
                        onClick={() => {}}
                      />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No service invoices for this project yet.
                      </div>
                    )}
                  </TabsContent>
                </>
              )}
              
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
        
        {/* Invoice Form Modal */}
        <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Invoice for {project.name}</DialogTitle>
            </DialogHeader>
            <InvoiceForm 
              projects={[project]} 
              onSubmit={(data) => {
                handleCreateInvoice(data);
                setShowInvoiceModal(false);
              }}
              selectedProjectId={project.id}
            />
          </DialogContent>
        </Dialog>
        
        {/* Edit Project Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update project information
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Project Name
                </Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-client" className="text-right">
                  Client
                </Label>
                <Input
                  id="edit-client"
                  value={editFormData.client}
                  onChange={(e) => setEditFormData({...editFormData, client: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select 
                  value={editFormData.status} 
                  onValueChange={(value) => setEditFormData({...editFormData, status: value as 'active' | 'completed' | 'pending'})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Budget Type
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Checkbox 
                    id="split-budget" 
                    checked={editFormData.splitBudget}
                    onCheckedChange={(checked) => setEditFormData({...editFormData, splitBudget: !!checked})}
                  />
                  <label
                    htmlFor="split-budget"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Split budget into hardware and service
                  </label>
                </div>
              </div>
              
              {!editFormData.splitBudget ? (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-budget" className="text-right">
                    Budget
                  </Label>
                  <Input
                    id="edit-budget"
                    type="number"
                    value={editFormData.budget}
                    onChange={(e) => setEditFormData({...editFormData, budget: Number(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-hardware-budget" className="text-right">
                      Hardware Budget
                    </Label>
                    <Input
                      id="edit-hardware-budget"
                      type="number"
                      value={editFormData.hardwareBudget}
                      onChange={(e) => setEditFormData({...editFormData, hardwareBudget: Number(e.target.value)})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-service-budget" className="text-right">
                      Service Budget
                    </Label>
                    <Input
                      id="edit-service-budget"
                      type="number"
                      value={editFormData.serviceBudget}
                      onChange={(e) => setEditFormData({...editFormData, serviceBudget: Number(e.target.value)})}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-start-date" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={editFormData.startDate}
                  onChange={(e) => setEditFormData({...editFormData, startDate: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-end-date" className="text-right">
                  End Date
                </Label>
                <Input
                  id="edit-end-date"
                  type="date"
                  value={editFormData.endDate}
                  onChange={(e) => setEditFormData({...editFormData, endDate: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitEdit}>
                Update Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetail; 