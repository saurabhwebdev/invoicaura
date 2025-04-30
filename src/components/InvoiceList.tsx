import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';
import { HardDrive, Wrench } from 'lucide-react';

export interface Invoice {
  id: string;
  projectId: string;
  projectName: string;
  invoiceNumber: string;
  amount: number;
  date: string;
  description: string;
  status: 'paid' | 'pending' | 'overdue';
  type?: 'hardware' | 'service';
  thirdParty?: {
    company: string;
    invoiceNumber: string;
    amount: number;
  };
}

interface InvoiceListProps {
  invoices: Invoice[];
  className?: string;
  title?: string;
  onClick: (invoice: Invoice) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ 
  invoices, 
  className,
  title = "Invoices",
  onClick
}) => {
  const { formatCurrency, formatDate } = useSettings();
  
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
  
  return (
    <Card className={cn("animate-fade-in", className)}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No invoices found.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Invoice #</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map(invoice => (
                  <TableRow 
                    key={invoice.id}
                    className="transition-all hover:bg-muted/50 cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      {invoice.thirdParty ? (
                        <div>
                          <div>{invoice.invoiceNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            {invoice.thirdParty.company}
                          </div>
                        </div>
                      ) : (
                        invoice.invoiceNumber
                      )}
                    </TableCell>
                    <TableCell>{invoice.projectName}</TableCell>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(invoice.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={cn("capitalize", getStatusColor(invoice.status))}
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onClick(invoice)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceList;
