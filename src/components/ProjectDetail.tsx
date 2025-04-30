import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, X, Plus, Clock, HardDrive, Wrench, Pencil, Trash2, AlertTriangle } from "lucide-react";
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
  const { createInvoice, updateProject, deleteProject } = useProjects();
  const { formatCurrency, formatDate } = useSettings();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: project.name,
    client: project.client,
    status: project.status,
    budget: project.budget,
    startDate: project.startDate,
    endDate: project.endDate,
    splitBudget: project.hardwareBudget !== undefined,
    hardwareBudget: project.hardwareBudget || 0,
    serviceBudget: project.serviceBudget || 0,
    gstEnabled: project.gstEnabled || false,
    gstPercentage: project.gstPercentage || 18,
    customGst: project.gstPercentage !== undefined && project.gstPercentage !== 18,
    tdsEnabled: project.tdsEnabled || false,
    tdsPercentage: project.tdsPercentage || 2,
    customTds: project.tdsPercentage !== undefined && project.tdsPercentage !== 2
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
      serviceBudget: project.serviceBudget || 0,
      gstEnabled: project.gstEnabled || false,
      gstPercentage: project.gstPercentage || 18,
      customGst: project.gstPercentage !== undefined && project.gstPercentage !== 18,
      tdsEnabled: project.tdsEnabled || false,
      tdsPercentage: project.tdsPercentage || 2,
      customTds: project.tdsPercentage !== undefined && project.tdsPercentage !== 2
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
      gstEnabled: editFormData.gstEnabled,
      tdsEnabled: editFormData.tdsEnabled,
      ...(editFormData.splitBudget && {
        hardwareBudget: Number(editFormData.hardwareBudget),
        serviceBudget: Number(editFormData.serviceBudget)
      })
    };
    
    // Add GST and TDS data
    if (editFormData.gstEnabled) {
      Object.assign(updatedProject, {
        gstPercentage: editFormData.customGst ? Number(editFormData.gstPercentage) : 18
      });
    } else {
      Object.assign(updatedProject, {
        gstPercentage: undefined
      });
    }
    
    if (editFormData.tdsEnabled) {
      Object.assign(updatedProject, {
        tdsPercentage: editFormData.customTds ? Number(editFormData.tdsPercentage) : 2
      });
    } else {
      Object.assign(updatedProject, {
        tdsPercentage: undefined
      });
    }
    
    updateProject(project.id, updatedProject);
    setShowEditModal(false);
  };
  
  const handleDeleteProject = async () => {
    try {
      await deleteProject(project.id);
      onClose();
    } catch (error) {
      console.error("Error in handleDeleteProject:", error);
    }
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
              <Button variant="ghost" size="icon" 
                className="text-red-500 hover:text-red-700 hover:bg-red-100"
                onClick={() => setShowDeleteModal(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-base">{project.client}</CardDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Budget</h3>
                <p className="text-xl font-semibold">{formatCurrency(project.budget)}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Invoiced</h3>
                <p className="text-xl font-semibold">{formatCurrency(project.invoiced)}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Remaining</h3>
                <p className="text-xl font-semibold">{formatCurrency(project.budget - project.invoiced)}</p>
              </div>
            </div>
            
            {/* Show budget details if the project has a split budget */}
            {hasBudgetSplit && (
              <div className="mt-6 border-t border-border pt-6">
                <h3 className="text-lg font-medium mb-4">Budget Breakdown</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-background rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-primary" />
                        <h4 className="font-medium">Hardware Budget</h4>
                      </div>
                      <span className="text-sm font-semibold">{formatCurrency(project.hardwareBudget || 0)}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Invoiced</span>
                        <span>{formatCurrency(project.hardwareInvoiced || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Remaining</span>
                        <span>{formatCurrency((project.hardwareBudget || 0) - (project.hardwareInvoiced || 0))}</span>
                      </div>
                    </div>
                    
                    <Progress 
                      value={project.hardwareBudget ? Math.min(100, (project.hardwareInvoiced || 0) / (project.hardwareBudget) * 100) : 0} 
                      className="h-2 mt-3" 
                    />
                  </div>
                  
                  <div className="bg-background rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-primary" />
                        <h4 className="font-medium">Service Budget</h4>
                      </div>
                      <span className="text-sm font-semibold">{formatCurrency(project.serviceBudget || 0)}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Invoiced</span>
                        <span>{formatCurrency(project.serviceInvoiced || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Remaining</span>
                        <span>{formatCurrency((project.serviceBudget || 0) - (project.serviceInvoiced || 0))}</span>
                      </div>
                    </div>
                    
                    <Progress 
                      value={project.serviceBudget ? Math.min(100, (project.serviceInvoiced || 0) / (project.serviceBudget) * 100) : 0} 
                      className="h-2 mt-3" 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
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
          
          {/* Tax Information */}
          {(project.gstEnabled || project.tdsEnabled) && (
            <div className="space-y-3 mt-4">
              <h4 className="text-sm font-semibold">Tax Information</h4>
              <div className="grid gap-2">
                {project.gstEnabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST Rate:</span>
                    <span className="font-medium">{project.gstPercentage || 18}%</span>
                  </div>
                )}
                
                {project.tdsEnabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">TDS Rate:</span>
                    <span className="font-medium">{project.tdsPercentage || 2}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
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
              
              {hasBudgetSplit ? (
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
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="text-right text-sm text-muted-foreground">
                      Total Budget
                    </div>
                    <div className="col-span-3 font-medium">
                      {formatCurrency(Number(editFormData.hardwareBudget) + Number(editFormData.serviceBudget))}
                    </div>
                  </div>
                </>
              ) : (
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

              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">
                  <Label htmlFor="edit-gst-enabled">GST</Label>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="edit-gst-enabled" 
                      checked={editFormData.gstEnabled}
                      onCheckedChange={(checked) => setEditFormData({...editFormData, gstEnabled: !!checked})}
                    />
                    <label
                      htmlFor="edit-gst-enabled"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Enable GST
                    </label>
                  </div>
                </div>
              </div>

              {editFormData.gstEnabled && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="text-right">
                      <Label>GST Rate</Label>
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="edit-custom-gst" 
                          checked={editFormData.customGst}
                          onCheckedChange={(checked) => {
                            const isCustom = !!checked;
                            setEditFormData({
                              ...editFormData, 
                              customGst: isCustom,
                              gstPercentage: isCustom ? editFormData.gstPercentage : 18
                            });
                          }}
                        />
                        <label
                          htmlFor="edit-custom-gst"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Custom GST rate
                        </label>
                      </div>
                    </div>
                  </div>

                  {editFormData.customGst ? (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-gst-percentage" className="text-right">
                        GST Percentage
                      </Label>
                      <div className="col-span-3 flex items-center">
                        <Input
                          id="edit-gst-percentage"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={editFormData.gstPercentage}
                          onChange={(e) => setEditFormData({...editFormData, gstPercentage: Number(e.target.value)})}
                          className="flex-1"
                        />
                        <span className="ml-2">%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="text-right">
                        <Label>Standard Rate</Label>
                      </div>
                      <div className="col-span-3 text-muted-foreground">
                        18% GST
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">
                  <Label htmlFor="edit-tds-enabled">TDS</Label>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="edit-tds-enabled" 
                      checked={editFormData.tdsEnabled}
                      onCheckedChange={(checked) => setEditFormData({...editFormData, tdsEnabled: !!checked})}
                    />
                    <label
                      htmlFor="edit-tds-enabled"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Enable TDS
                    </label>
                  </div>
                </div>
              </div>

              {editFormData.tdsEnabled && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="text-right">
                      <Label>TDS Rate</Label>
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="edit-custom-tds" 
                          checked={editFormData.customTds}
                          onCheckedChange={(checked) => {
                            const isCustom = !!checked;
                            setEditFormData({
                              ...editFormData, 
                              customTds: isCustom,
                              tdsPercentage: isCustom ? editFormData.tdsPercentage : 2
                            });
                          }}
                        />
                        <label
                          htmlFor="edit-custom-tds"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Custom TDS rate
                        </label>
                      </div>
                    </div>
                  </div>

                  {editFormData.customTds ? (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-tds-percentage" className="text-right">
                        TDS Percentage
                      </Label>
                      <div className="col-span-3 flex items-center">
                        <Input
                          id="edit-tds-percentage"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={editFormData.tdsPercentage}
                          onChange={(e) => setEditFormData({...editFormData, tdsPercentage: Number(e.target.value)})}
                          className="flex-1"
                        />
                        <span className="ml-2">%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="text-right">
                        <Label>Standard Rate</Label>
                      </div>
                      <div className="col-span-3 text-muted-foreground">
                        2% TDS
                      </div>
                    </div>
                  )}
                </>
              )}
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
        
        {/* Delete Project Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Confirm Delete
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this project? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
              <p className="font-medium">{project.name}</p>
              <p className="text-sm text-muted-foreground">{project.client}</p>
              {projectInvoices.length > 0 && (
                <p className="text-sm text-red-600 mt-2">
                  Warning: This project has {projectInvoices.length} invoices. 
                  You cannot delete a project with associated invoices.
                </p>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteProject}
                disabled={projectInvoices.length > 0}>
                Delete Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetail; 