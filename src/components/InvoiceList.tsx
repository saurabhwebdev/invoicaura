import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

export interface Invoice {
  id: string;
  projectId: string;
  projectName: string;
  invoiceNumber: string;
  amount: number;
  date: string;
  description: string;
  status: 'paid' | 'pending' | 'overdue';
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
        return 'bg-green-500/20 text-green-600 border-green-500/50';
      case 'pending':
        return 'bg-amber-500/20 text-amber-600 border-amber-500/50';
      case 'overdue':
        return 'bg-red-500/20 text-red-600 border-red-500/50';
      default:
        return 'bg-slate-500/20 text-slate-600 border-slate-500/50';
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
