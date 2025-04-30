import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import { cn } from '@/lib/utils';

interface InvoiceFormProps {
  projects: Array<{ id: string; name: string; budget: number; invoiced: number; }>;
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
    date: new Date().toISOString().split('T')[0]
  });
  
  // Update formData if selectedProjectId changes
  useEffect(() => {
    if (selectedProjectId) {
      setFormData(prev => ({ ...prev, projectId: selectedProjectId }));
    }
  }, [selectedProjectId]);
  
  const selectedProject = projects.find(p => p.id === formData.projectId);
  const remainingBudget = selectedProject ? selectedProject.budget - selectedProject.invoiced : 0;
  const isOverBudget = selectedProject && Number(formData.amount) > remainingBudget;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSelectProject = (value: string) => {
    setFormData({ ...formData, projectId: value });
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
    
    if (isOverBudget) {
      toast({
        title: "Budget Warning",
        description: "This invoice exceeds the remaining project budget",
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
      date: new Date().toISOString().split('T')[0]
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
              {selectedProject && (
                <p className="text-xs text-muted-foreground mt-1">
                  Remaining budget: ${remainingBudget.toLocaleString()}
                </p>
              )}
            </div>
          )}
          
          {hideProjectSelection && selectedProject && (
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
                This amount exceeds the remaining budget.
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
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="ml-2">
              Create Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceForm;
