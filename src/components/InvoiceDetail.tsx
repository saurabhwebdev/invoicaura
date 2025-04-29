import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from '@/lib/utils';
import { Invoice } from './InvoiceList';
import { useSettings } from '@/context/SettingsContext';

interface InvoiceDetailProps {
  invoice: Invoice;
  open: boolean;
  onClose: () => void;
  onStatusChange?: (invoiceId: string, status: 'paid' | 'pending' | 'overdue') => void;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ 
  invoice, 
  open, 
  onClose,
  onStatusChange 
}) => {
  const { formatCurrency, formatDate } = useSettings();
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid':
        return 'bg-green-500/20 text-green-600 border-green-500/50';
      case 'pending':
        return 'bg-amber-500/20 text-amber-600 border-amber-500/50';
      case 'overdue':
        return 'bg-red-500/20 text-red-600 border-red-500/50';
      default:
        return 'bg-slate-500/20 text-slate-600 border-slate-500/50';
    }
  };
  
  const handleStatusChange = (status: 'paid' | 'pending' | 'overdue') => {
    if (onStatusChange) {
      onStatusChange(invoice.id, status);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice {invoice.invoiceNumber}</span>
            <Badge 
              variant="outline"
              className={cn("capitalize", getStatusColor(invoice.status))}
            >
              {invoice.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {invoice.thirdParty ? (
              <span>Third-party invoice from {invoice.thirdParty.company}</span>
            ) : (
              <span>Client invoice for {invoice.projectName}</span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Project</p>
                <p className="font-medium">{invoice.projectName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium">{formatCurrency(invoice.amount)}</p>
              </div>
              <div className="flex items-start gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(invoice.date)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {getStatusIcon(invoice.status)}
                  <span className="font-medium capitalize">{invoice.status}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm">{invoice.description || "No description provided."}</p>
          </div>
          
          {invoice.thirdParty && (
            <div>
              <h3 className="font-medium mb-2">Third-Party Information</h3>
              <div className="bg-muted/50 rounded-md p-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-muted-foreground">Company</p>
                    <p className="font-medium">{invoice.thirdParty.company}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Invoice #</p>
                    <p className="font-medium">{invoice.thirdParty.invoiceNumber}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {onStatusChange && !invoice.thirdParty && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-2">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleStatusChange('pending')}
                    className={invoice.status === 'pending' ? 'bg-amber-500/20 border-amber-500/50' : ''}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Pending
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleStatusChange('paid')}
                    className={invoice.status === 'paid' ? 'bg-green-500/20 border-green-500/50' : ''}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Paid
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleStatusChange('overdue')}
                    className={invoice.status === 'overdue' ? 'bg-red-500/20 border-red-500/50' : ''}
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Overdue
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetail; 