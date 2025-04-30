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
import { useSettings } from '@/context/SettingsContext';

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
    poNumbers?: {
      hardware?: string;
      software?: string;
      combined?: string;
    };
    currentPo?: 'hardware' | 'software' | 'combined';
    activePOs?: ('hardware' | 'software' | 'combined')[];
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
  const { formatCurrency } = useSettings();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectId: selectedProjectId || '',
    amount: '',
    invoiceNumber: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'service' as 'hardware' | 'service' | undefined,
    poNumber: '' as string
  });
  
  // Update formData if selectedProjectId changes
  useEffect(() => {
    if (selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId);
      let poNumber = '';
      
      // Set default PO based on current project PO setting or first active PO
      if (project?.poNumbers) {
        if (project.activePOs?.length) {
          // If there are active POs, use the first one as default
          const firstActivePo = project.activePOs[0];
          if (firstActivePo === 'hardware' && project.poNumbers.hardware) {
            poNumber = project.poNumbers.hardware;
          } else if (firstActivePo === 'software' && project.poNumbers.software) {
            poNumber = project.poNumbers.software;
          } else if (firstActivePo === 'combined' && project.poNumbers.combined) {
            poNumber = project.poNumbers.combined;
          }
        } else if (project.currentPo) {
          // Backward compatibility with currentPo
          if (project.currentPo === 'hardware' && project.poNumbers.hardware) {
            poNumber = project.poNumbers.hardware;
          } else if (project.currentPo === 'software' && project.poNumbers.software) {
            poNumber = project.poNumbers.software;
          } else if (project.currentPo === 'combined' && project.poNumbers.combined) {
            poNumber = project.poNumbers.combined;
          }
        } else {
          // Fallback to any available PO
          if (project.poNumbers.combined) {
            poNumber = project.poNumbers.combined;
          } else if (project.poNumbers.hardware) {
            poNumber = project.poNumbers.hardware;
          } else if (project.poNumbers.software) {
            poNumber = project.poNumbers.software;
          }
        }
      }
      
      setFormData(prev => ({ 
        ...prev, 
        projectId: selectedProjectId,
        poNumber: poNumber
      }));
    }
  }, [selectedProjectId, projects]);
  
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
    const project = projects.find(p => p.id === value);
    let poNumber = '';
    
    // Set default PO based on active POs or current project PO setting
    if (project?.poNumbers) {
      if (project.activePOs?.length) {
        // If there are active POs, use the first one as default
        const firstActivePo = project.activePOs[0];
        if (firstActivePo === 'hardware' && project.poNumbers.hardware) {
          poNumber = project.poNumbers.hardware;
        } else if (firstActivePo === 'software' && project.poNumbers.software) {
          poNumber = project.poNumbers.software;
        } else if (firstActivePo === 'combined' && project.poNumbers.combined) {
          poNumber = project.poNumbers.combined;
        }
      } else if (project.currentPo) {
        // Backward compatibility with currentPo
        if (project.currentPo === 'hardware' && project.poNumbers.hardware) {
          poNumber = project.poNumbers.hardware;
        } else if (project.currentPo === 'software' && project.poNumbers.software) {
          poNumber = project.poNumbers.software;
        } else if (project.currentPo === 'combined' && project.poNumbers.combined) {
          poNumber = project.poNumbers.combined;
        }
      } else {
        // Fallback to any available PO
        if (project.poNumbers.combined) {
          poNumber = project.poNumbers.combined;
        } else if (project.poNumbers.hardware) {
          poNumber = project.poNumbers.hardware;
        } else if (project.poNumbers.software) {
          poNumber = project.poNumbers.software;
        }
      }
    }
    
    setFormData({ 
      ...formData, 
      projectId: value,
      poNumber
    });
  };

  const handleSelectType = (value: string) => {
    const type = value as 'hardware' | 'service';
    let poNumber = '';
    
    // If the project has PO numbers, select the appropriate one based on type
    if (selectedProject?.poNumbers) {
      if (type === 'hardware' && selectedProject.poNumbers.hardware) {
        poNumber = selectedProject.poNumbers.hardware;
      } else if (type === 'service' && selectedProject.poNumbers.software) {
        poNumber = selectedProject.poNumbers.software;
      } else if (selectedProject.poNumbers.combined) {
        poNumber = selectedProject.poNumbers.combined;
      }
    }
    
    setFormData({ ...formData, type, poNumber });
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
      status: 'pending',
      poNumber: formData.poNumber
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
      type: 'service',
      poNumber: ''
    });
    
    setOpen(false);
  };
  
  // Add helper functions to get available POs and PO type label
  const getAvailablePOs = () => {
    if (!selectedProject?.poNumbers) return [];
    
    const availablePOs = [];
    const activePOTypes = selectedProject.activePOs || (selectedProject.currentPo ? [selectedProject.currentPo] : []);
    
    // If we have active POs defined, only include those
    if (activePOTypes.length > 0) {
      if (activePOTypes.includes('hardware') && selectedProject.poNumbers.hardware) {
        availablePOs.push({ 
          value: selectedProject.poNumbers.hardware, 
          label: `Hardware PO: ${selectedProject.poNumbers.hardware}` 
        });
      }
      
      if (activePOTypes.includes('software') && selectedProject.poNumbers.software) {
        availablePOs.push({ 
          value: selectedProject.poNumbers.software, 
          label: `Software PO: ${selectedProject.poNumbers.software}` 
        });
      }
      
      if (activePOTypes.includes('combined') && selectedProject.poNumbers.combined) {
        availablePOs.push({ 
          value: selectedProject.poNumbers.combined, 
          label: `Combined PO: ${selectedProject.poNumbers.combined}` 
        });
      }
    } else {
      // If no active POs defined, include all available POs
      if (selectedProject.poNumbers.hardware) {
        availablePOs.push({ 
          value: selectedProject.poNumbers.hardware, 
          label: `Hardware PO: ${selectedProject.poNumbers.hardware}` 
        });
      }
      
      if (selectedProject.poNumbers.software) {
        availablePOs.push({ 
          value: selectedProject.poNumbers.software, 
          label: `Software PO: ${selectedProject.poNumbers.software}` 
        });
      }
      
      if (selectedProject.poNumbers.combined) {
        availablePOs.push({ 
          value: selectedProject.poNumbers.combined, 
          label: `Combined PO: ${selectedProject.poNumbers.combined}` 
        });
      }
    }
    
    return availablePOs;
  };

  const getPOTypeLabel = (poNumber: string) => {
    if (!selectedProject?.poNumbers) return "";
    
    if (selectedProject.poNumbers.hardware === poNumber) {
      return "Using Hardware PO";
    } else if (selectedProject.poNumbers.software === poNumber) {
      return "Using Software PO";
    } else if (selectedProject.poNumbers.combined === poNumber) {
      return "Using Combined PO";
    }
    
    return "";
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
                  Remaining budget: {formatCurrency(remainingBudget)}
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
                  Remaining: {formatCurrency(remainingBudget)}
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
                      {formatCurrency(remainingHardwareBudget)}
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
                      {formatCurrency(remainingServiceBudget)}
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
          
          {selectedProject?.poNumbers && (
            <div className="space-y-2">
              <Label htmlFor="poNumber">Purchase Order Number</Label>
              {getAvailablePOs().length > 1 ? (
                <Select
                  value={formData.poNumber}
                  onValueChange={(value) => setFormData({...formData, poNumber: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select PO number" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePOs().map(po => (
                      <SelectItem key={po.value} value={po.value}>
                        {po.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="poNumber"
                  name="poNumber"
                  value={formData.poNumber}
                  onChange={handleChange}
                  placeholder="PO Number"
                  readOnly={!!formData.poNumber}
                  className={!!formData.poNumber ? "bg-muted cursor-not-allowed" : ""}
                />
              )}
              {!!formData.poNumber && (
                <p className="text-xs text-muted-foreground">
                  {getPOTypeLabel(formData.poNumber)}
                </p>
              )}
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
