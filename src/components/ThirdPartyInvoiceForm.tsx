import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Receipt } from "lucide-react";
import { cn } from '@/lib/utils';
import { Invoice } from './InvoiceList';
import { useSettings } from '@/context/SettingsContext';

interface ThirdPartyInvoiceFormProps {
  onSubmit: (thirdPartyData: {
    projectId: string;
    clientInvoiceId?: string;
    company: string;
    invoiceNumber: string;
    amount: number;
    description: string;
    date: string;
  }) => void;
  projects: Array<{ id: string; name: string; client: string }>;
  invoices: Invoice[];
  className?: string;
}

const ThirdPartyInvoiceForm: React.FC<ThirdPartyInvoiceFormProps> = ({ 
  onSubmit, 
  projects, 
  invoices,
  className
}) => {
  const { toast } = useToast();
  const { formatCurrency } = useSettings();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    clientInvoiceId: '',
    company: '',
    invoiceNumber: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const selectedProject = projects.find(p => p.id === formData.projectId);
  const projectInvoices = invoices.filter(inv => inv.projectId === formData.projectId);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId || !formData.company || !formData.amount || !formData.invoiceNumber) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    const newThirdPartyInvoice = {
      projectId: formData.projectId,
      clientInvoiceId: formData.clientInvoiceId,
      company: formData.company,
      invoiceNumber: formData.invoiceNumber,
      amount: Number(formData.amount),
      description: formData.description,
      date: formData.date
    };
    
    onSubmit(newThirdPartyInvoice);
    toast({
      title: "Third-Party Invoice Added",
      description: `Invoice from ${formData.company} has been added.`
    });
    
    setFormData({
      projectId: '',
      clientInvoiceId: '',
      company: '',
      invoiceNumber: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn("gap-2", className)}>
          <Receipt className="h-4 w-4" />
          Third-Party Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Third-Party Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="projectId">Project</Label>
            <Select
              value={formData.projectId}
              onValueChange={(value) => handleSelectChange("projectId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} ({project.client})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientInvoiceId">Link to Client Invoice (Optional)</Label>
            <Select
              value={formData.clientInvoiceId}
              onValueChange={(value) => handleSelectChange("clientInvoiceId", value)}
              disabled={!formData.projectId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Link to client invoice (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (Create separate invoice)</SelectItem>
                {projectInvoices.map((invoice) => (
                  <SelectItem key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber} - {formatCurrency(invoice.amount)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Linking will attach this third-party invoice to an existing client invoice
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Third-Party Company</Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              placeholder="TP-INV-001"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
            />
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
              Add Third-Party Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ThirdPartyInvoiceForm;
