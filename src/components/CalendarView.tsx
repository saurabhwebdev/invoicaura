import React, { useState } from 'react';
import { Calendar as CalendarIcon, Flag } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { Project } from '@/lib/dbService';
import { Invoice } from './InvoiceList';

interface CalendarViewProps {
  projects: Project[];
  invoices: Invoice[];
  onProjectSelect?: (project: Project) => void;
  onInvoiceSelect?: (invoice: Invoice) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  projects, 
  invoices,
  onProjectSelect,
  onInvoiceSelect
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Format dates for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get all important dates (project start/end dates and invoice dates)
  const getImportantDates = () => {
    const dates: {[key: string]: {type: 'project-start' | 'project-end' | 'invoice', items: any[]}} = {};
    
    // Add project start and end dates
    projects.forEach(project => {
      const startDate = project.startDate.split('T')[0];
      if (!dates[startDate]) {
        dates[startDate] = { type: 'project-start', items: [] };
      }
      dates[startDate].items.push(project);
      
      const endDate = project.endDate.split('T')[0];
      if (!dates[endDate]) {
        dates[endDate] = { type: 'project-end', items: [] };
      }
      dates[endDate].items.push(project);
    });
    
    // Add invoice dates
    invoices.forEach(invoice => {
      const invoiceDate = invoice.date.split('T')[0];
      if (!dates[invoiceDate]) {
        dates[invoiceDate] = { type: 'invoice', items: [] };
      }
      dates[invoiceDate].items.push(invoice);
    });
    
    return dates;
  };
  
  // Customize day contents to show if there are events on that day
  const importantDates = getImportantDates();
  
  // Generate the list of events for the selected date
  const getEventsForSelectedDate = () => {
    if (!date) return null;
    
    const dateKey = date.toISOString().split('T')[0];
    const events = importantDates[dateKey];
    
    if (!events || events.items.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          No events scheduled for this date.
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {events.items.map((item, index) => {
          if ('invoiceNumber' in item) {
            // It's an invoice
            const invoice = item as Invoice;
            return (
              <Card 
                key={`invoice-${invoice.id}-${index}`}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onInvoiceSelect && onInvoiceSelect(invoice)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Invoice #{invoice.invoiceNumber}</h4>
                      <p className="text-sm text-muted-foreground">
                        {invoice.projectName}
                      </p>
                    </div>
                    <Badge className={cn(
                      "ml-2 capitalize",
                      invoice.status === 'paid' ? "bg-aura-green/10 text-aura-green" :
                      invoice.status === 'pending' ? "bg-aura-orange/10 text-aura-orange" :
                      "bg-aura-red/10 text-aura-red"
                    )}>
                      {invoice.status}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">${invoice.amount.toLocaleString()}</span>
                    {invoice.thirdParty && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Third-Party: {invoice.thirdParty.company})
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          } else {
            // It's a project
            const project = item as Project;
            const isStartDate = dateKey === project.startDate.split('T')[0];
            const isEndDate = dateKey === project.endDate.split('T')[0];
            
            return (
              <Card 
                key={`project-${project.id}-${isStartDate ? 'start' : 'end'}-${index}`}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onProjectSelect && onProjectSelect(project)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {project.client}
                      </p>
                    </div>
                    <Badge className={cn(
                      "ml-2 capitalize",
                      project.status === 'active' ? "bg-aura-green/10 text-aura-green" :
                      project.status === 'completed' ? "bg-aura-blue/10 text-aura-blue" :
                      "bg-aura-orange/10 text-aura-orange"
                    )}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm flex items-center gap-1">
                    <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>
                      {isStartDate ? 'Project Starts' : 'Project Deadline'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-5">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            modifiers={{
              importantDay: (day) => {
                const dateKey = day.toISOString().split('T')[0];
                return !!importantDates[dateKey];
              },
            }}
            modifiersStyles={{
              importantDay: {
                fontWeight: 'bold',
                backgroundColor: 'var(--accent)',
                borderRadius: '50%',
              },
            }}
          />
        </CardContent>
      </Card>
      
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>
            Events for {date?.toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getEventsForSelectedDate()}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView; 