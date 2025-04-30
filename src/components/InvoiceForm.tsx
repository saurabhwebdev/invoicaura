import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, HardDrive, Wrench } from "lucide-react";
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface InvoiceFormProps {
  projects: Array<{ 
    id: string; 
    name: string; 
    budget: number; 
    invoiced: number; 
    hardwareBudget?: number;
    serviceBudget?: number;
    hardwareInvoiced?: number;
    serviceInvoiced?: number;
  }>;
  onSubmit: (invoice: any) => void;
  className?: string;
  selectedProjectId?: string;
  hideProjectSelection?: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ 
  projects, 
  onSubmit, 
  className,
  selectedProjectId,
  hideProjectSelection = false
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectId: selectedProjectId || '',
    amount: '',
    invoiceNumber: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'service' as 'hardware' | 'service' | undefined
  });
  
  // Update formData if selectedProjectId changes
  useEffect(() => {
    if (selectedProjectId) {
      setFormData(prev => ({ ...prev, projectId: selectedProjectId }));
    }
  }, [selectedProjectId]);
  
  const selectedProject = projects.find(p => p.id === formData.projectId);
  const remainingBudget = selectedProject ? selectedProject.budget - selectedProject.invoiced : 0;
  
  // Check if project has hardware/service budget split
  const hasBudgetSplit = selectedProject && 
    selectedProject.hardwareBudget !== undefined && 
    selectedProject.serviceBudget !== undefined;
  
  // Calculate remaining hardware and service budgets
  const remainingHardwareBudget = hasBudgetSplit ? 
    (selectedProject?.hardwareBudget || 0) - (selectedProject?.hardwareInvoiced || 0) : 0;
  
  const remainingServiceBudget = hasBudgetSplit ? 
    (selectedProject?.serviceBudget || 0) - (selectedProject?.serviceInvoiced || 0) : 0;
  
  // Check if over budget based on invoice type
  const isOverBudget = selectedProject && (
    !hasBudgetSplit 
      ? Number(formData.amount) > remainingBudget
      : formData.type === 'hardware'
        ? Number(formData.amount) > remainingHardwareBudget
        : Number(formData.amount) > remainingServiceBudget
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSelectProject = (value: string) => {
    setFormData({ ...formData, projectId: value });
  };

  const handleSelectType = (value: string) => {
    setFormData({ ...formData, type: value as 'hardware' | 'service' });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId || !formData.amount || !formData.invoiceNumber) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (hasBudgetSplit && !formData.type) {
      toast({
        title: "Missing Type",
        description: "Please select an invoice type (Hardware or Service)",
        variant: "destructive"
      });
      return;
    }
    
    if (isOverBudget) {
      toast({
        title: "Budget Warning",
        description: hasBudgetSplit 
          ? `This invoice exceeds the remaining ${formData.type} budget`
          : "This invoice exceeds the remaining project budget",
        variant: "destructive"
      });
      return;
    }
    
    const newInvoice = {
      id: crypto.randomUUID(),
      ...formData,
      amount: Number(formData.amount),
      date: formData.date,
      status: 'pending'
    };
    
    onSubmit(newInvoice);
    toast({
      title: "Invoice Created",
      description: `Invoice #${formData.invoiceNumber} has been created.`
    });
    
    setFormData({
      projectId: selectedProjectId || '',
      amount: '',
      invoiceNumber: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'service'
    });
    
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn("gap-2 bg-violet-200 hover:bg-violet-300 text-violet-800 border-none", className)}>
          <PlusCircle className="h-4 w-4" />
          New Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {!hideProjectSelection && (
            <div className="space-y-2">
              <Label htmlFor="projectId">Project</Label>
              <Select
                value={formData.projectId}
                onValueChange={handleSelectProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProject && !hasBudgetSplit && (
                <p className="text-xs text-muted-foreground mt-1">
                  Remaining budget: ${remainingBudget.toLocaleString()}
                </p>
              )}
            </div>
          )}
          
          {hideProjectSelection && selectedProject && !hasBudgetSplit && (
            <div className="space-y-2">
              <Label>Project</Label>
              <div className="flex justify-between border rounded-md p-2">
                <span className="font-medium">{selectedProject.name}</span>
                <span className="text-muted-foreground text-sm">
                  Remaining: ${remainingBudget.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Show project with budget split info */}
          {selectedProject && hasBudgetSplit && (
            <div className="space-y-2">
              <Label>{hideProjectSelection ? 'Project' : 'Budget Information'}</Label>
              <div className="border rounded-md p-3 space-y-2">
                {hideProjectSelection && (
                  <div className="font-medium pb-2">{selectedProject.name}</div>
                )}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Hardware Budget:</span>
                    <div className="font-medium">${selectedProject.hardwareBudget?.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Remaining:</span>
                    <div className={cn(
                      "font-medium",
                      remainingHardwareBudget < 0.2 * (selectedProject.hardwareBudget || 0) ? "text-aura-red" : ""
                    )}>
                      ${remainingHardwareBudget.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Service Budget:</span>
                    <div className="font-medium">${selectedProject.serviceBudget?.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Remaining:</span>
                    <div className={cn(
                      "font-medium",
                      remainingServiceBudget < 0.2 * (selectedProject.serviceBudget || 0) ? "text-aura-red" : ""
                    )}>
                      ${remainingServiceBudget.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              placeholder="INV-001"
            />
          </div>

          {selectedProject && hasBudgetSplit && (
            <div className="space-y-2">
              <Label>Invoice Type</Label>
              <RadioGroup value={formData.type} onValueChange={handleSelectType} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hardware" id="hardware" />
                  <Label htmlFor="hardware" className="cursor-pointer flex items-center gap-1.5">
                    <HardDrive className="h-4 w-4 text-aura-blue" />
                    Hardware
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="service" id="service" />
                  <Label htmlFor="service" className="cursor-pointer flex items-center gap-1.5">
                    <Wrench className="h-4 w-4 text-aura-purple" />
                    Service
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              className={isOverBudget ? "border-destructive" : ""}
            />
            {isOverBudget && (
              <p className="text-xs text-destructive">
                {hasBudgetSplit 
                  ? `This amount exceeds the remaining ${formData.type} budget.`
                  : "This amount exceeds the remaining budget."}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description of services"
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full sm:w-auto">
              Create Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceForm;
