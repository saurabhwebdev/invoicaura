import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, CheckCircle, Clock, AlertCircle, HardDrive, Wrench } from "lucide-react";
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
        return <CheckCircle className="h-5 w-5 text-aura-green" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-aura-orange" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-aura-red" />;
      default:
        return null;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid':
        return 'bg-aura-green/20 text-aura-green border-aura-green/50';
      case 'pending':
        return 'bg-aura-orange/20 text-aura-orange border-aura-orange/50';
      case 'overdue':
        return 'bg-aura-red/20 text-aura-red border-aura-red/50';
      default:
        return 'bg-aura-gray/20 text-aura-gray border-aura-gray/50';
    }
  };

  const getTypeColor = (type?: string) => {
    switch(type) {
      case 'hardware':
        return 'bg-aura-blue/20 text-aura-blue border-aura-blue/50';
      case 'service':
        return 'bg-aura-purple/20 text-aura-purple border-aura-purple/50';
      default:
        return '';
    }
  };

  const getTypeIcon = (type?: string) => {
    switch(type) {
      case 'hardware':
        return <HardDrive className="h-5 w-5 text-aura-blue" />;
      case 'service':
        return <Wrench className="h-5 w-5 text-aura-purple" />;
      default:
        return null;
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
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center">
              <span>Invoice {invoice.invoiceNumber}</span>
            </DialogTitle>
            <div className="flex gap-2">
              {invoice.type && (
                <Badge 
                  variant="outline"
                  className={cn("capitalize flex items-center gap-1", getTypeColor(invoice.type))}
                >
                  {invoice.type === 'hardware' ? (
                    <HardDrive className="h-3 w-3" />
                  ) : (
                    <Wrench className="h-3 w-3" />
                  )}
                  {invoice.type}
                </Badge>
              )}
              <Badge 
                variant="outline"
                className={cn("capitalize", getStatusColor(invoice.status))}
              >
                {invoice.status}
              </Badge>
            </div>
          </div>
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
              {invoice.type && (
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {getTypeIcon(invoice.type)}
                    <span className="font-medium capitalize">{invoice.type}</span>
                  </div>
                </div>
              )}
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
                    className={invoice.status === 'pending' ? 'bg-aura-orange/20 border-aura-orange/50' : ''}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Pending
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleStatusChange('paid')}
                    className={invoice.status === 'paid' ? 'bg-aura-green/20 border-aura-green/50' : ''}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Paid
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleStatusChange('overdue')}
                    className={invoice.status === 'overdue' ? 'bg-aura-red/20 border-aura-red/50' : ''}
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