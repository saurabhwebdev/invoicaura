import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvoiceList, { Invoice } from '@/components/InvoiceList';
import InvoiceDetail from '@/components/InvoiceDetail';
import InvoiceForm from '@/components/InvoiceForm';
import ThirdPartyInvoiceForm from '@/components/ThirdPartyInvoiceForm';
import { useProjects } from '@/context/ProjectsContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { FileText, Receipt, RefreshCcw } from 'lucide-react';

const Invoices = () => {
  const { toast } = useToast();
  const { projects, invoices, createInvoice, createThirdPartyInvoice, updateInvoiceStatus, refreshData } = useProjects();
  const [activeTab, setActiveTab] = useState("clientInvoices");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };
  
  const handleStatusChange = async (invoiceId: string, newStatus: 'paid' | 'pending' | 'overdue') => {
    try {
      await updateInvoiceStatus(invoiceId, newStatus);
      setSelectedInvoice(null);
    } catch (error) {
      console.error("Error in Invoices page when updating invoice status:", error);
      // Toast is already shown by the ProjectsContext
    }
  };

  const handleCreateInvoice = (newInvoice: any) => {
    // Add project name to invoice
    const project = projects.find(p => p.id === newInvoice.projectId);
    
    if (!project) {
      toast({
        title: "Error",
        description: "Project not found",
        variant: "destructive"
      });
      return;
    }
    
    const invoice = {
      ...newInvoice,
      projectName: project.name
    };
    
    // Update invoices state
    createInvoice(invoice);
    
    toast({
      title: "Invoice Created",
      description: `Invoice ${invoice.invoiceNumber} created successfully.`
    });
  };

  const handleCreateThirdPartyInvoice = (thirdPartyData: any) => {
    const { clientInvoiceId, projectId, company, invoiceNumber, amount, date, description } = thirdPartyData;
    
    createThirdPartyInvoice(thirdPartyData);
    
    toast({
      title: "Third-Party Invoice Created",
      description: `Invoice from ${company} has been created successfully.`
    });
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const success = await refreshData();
      if (success) {
        toast({
          title: "Success",
          description: "Data refreshed successfully"
        });
      } else {
        toast({
          title: "Warning",
          description: "Unable to refresh data completely. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get third-party invoices
  const thirdPartyInvoices = invoices.filter(invoice => invoice.thirdParty);

  // Get pending invoices
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending');
  
  // Get paid invoices
  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid');

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">
              Manage all your client and third-party invoices
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            <InvoiceForm 
              projects={projects} 
              onSubmit={handleCreateInvoice}
              className="w-full sm:w-auto"
            />
            <ThirdPartyInvoiceForm
              projects={projects}
              invoices={invoices}
              onSubmit={handleCreateThirdPartyInvoice}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
        
        <Tabs defaultValue="clientInvoices" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="clientInvoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Client Invoices
            </TabsTrigger>
            <TabsTrigger value="thirdParty" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Third-Party Invoices
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="clientInvoices" className="mt-4 space-y-4">
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                <InvoiceList 
                  invoices={invoices.filter(i => !i.thirdParty)} 
                  title="Client Invoices"
                  onClick={handleInvoiceClick}
                />
              </TabsContent>
              
              <TabsContent value="pending" className="mt-4">
                <InvoiceList 
                  invoices={pendingInvoices.filter(i => !i.thirdParty)} 
                  title="Pending Invoices"
                  onClick={handleInvoiceClick}
                />
              </TabsContent>
              
              <TabsContent value="paid" className="mt-4">
                <InvoiceList 
                  invoices={paidInvoices.filter(i => !i.thirdParty)} 
                  title="Paid Invoices"
                  onClick={handleInvoiceClick}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="thirdParty" className="mt-4">
            <InvoiceList 
              invoices={invoices.filter(i => i.thirdParty)} 
              title="Third-Party Invoices"
              onClick={handleInvoiceClick}
            />
          </TabsContent>
        </Tabs>
        
        {/* Invoice Detail Dialog */}
        {selectedInvoice && (
          <InvoiceDetail 
            invoice={selectedInvoice}
            open={!!selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </Layout>
  );
};

export default Invoices;
