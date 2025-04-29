import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvoiceList, { Invoice } from '@/components/InvoiceList';
import ThirdPartyInvoiceForm from '@/components/ThirdPartyInvoiceForm';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Receipt, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProjects } from '@/context/ProjectsContext';
import { useSettings } from '@/context/SettingsContext';

interface Vendor {
  id: string;
  name: string;
  contactEmail: string;
  status: "active" | "inactive";
  totalInvoiced: number;
}

const ThirdParty = () => {
  const { toast } = useToast();
  const { projects, invoices, createThirdPartyInvoice, loading } = useProjects();
  const { formatCurrency } = useSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: "",
    contactEmail: "",
    status: "active"
  });
  
  const [thirdPartyVendors, setThirdPartyVendors] = useState<Vendor[]>([
    { id: "1", name: "DevTech Solutions", contactEmail: "info@devtech.com", status: "active", totalInvoiced: 15500 },
    { id: "2", name: "GraphicDesign Pro", contactEmail: "contact@graphicdesign.pro", status: "active", totalInvoiced: 8200 },
    { id: "3", name: "Content Writers Inc", contactEmail: "billing@contentwriters.inc", status: "inactive", totalInvoiced: 3400 },
    { id: "4", name: "ServerSolutions LLC", contactEmail: "accounts@serversolutions.com", status: "active", totalInvoiced: 9800 },
  ]);

  // Get third-party invoices
  const thirdPartyInvoices = invoices.filter(invoice => invoice.thirdParty);
  
  // Calculate vendor totals from actual invoices
  const vendorTotals = thirdPartyInvoices.reduce((acc, invoice) => {
    if (invoice.thirdParty && invoice.thirdParty.company) {
      const company = invoice.thirdParty.company;
      acc[company] = (acc[company] || 0) + invoice.thirdParty.amount;
    }
    return acc;
  }, {} as Record<string, number>);
  
  // Update vendor totals based on actual invoices
  const updatedVendors = thirdPartyVendors.map(vendor => ({
    ...vendor,
    totalInvoiced: vendorTotals[vendor.name] || vendor.totalInvoiced
  }));
  
  const handleCreateThirdPartyInvoice = (thirdPartyData: any) => {
    createThirdPartyInvoice(thirdPartyData);
    
    // Update vendor's total invoiced amount (this will be overwritten when data reloads)
    setThirdPartyVendors(prev => prev.map(vendor => {
      if (vendor.name === thirdPartyData.company) {
        return {
          ...vendor,
          totalInvoiced: vendor.totalInvoiced + thirdPartyData.amount
        };
      }
      return vendor;
    }));
  };

  const handleAddVendor = () => {
    setShowVendorDialog(true);
  };
  
  const handleSubmitVendor = () => {
    // Validation
    if (!newVendor.name || !newVendor.contactEmail) {
      toast({
        title: "Missing Information",
        description: "Please provide a vendor name and contact email.",
        variant: "destructive"
      });
      return;
    }
    
    // Create new vendor
    const vendor: Vendor = {
      id: crypto.randomUUID(),
      name: newVendor.name,
      contactEmail: newVendor.contactEmail,
      status: "active" as const,
      totalInvoiced: 0
    };
    
    setThirdPartyVendors([...thirdPartyVendors, vendor]);
    setShowVendorDialog(false);
    
    // Reset form
    setNewVendor({
      name: "",
      contactEmail: "",
      status: "active"
    });
    
    toast({
      title: "Vendor Added",
      description: `${vendor.name} has been added to your vendors.`
    });
  };

  const handleVendorClick = (vendor: Vendor) => {
    // View vendor details or something
    toast({
      title: "Vendor Selected",
      description: `Selected ${vendor.name}`
    });
  };

  // Filter vendors by search term
  const filteredVendors = thirdPartyVendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get vendor invoices for a specific vendor
  const getVendorInvoices = (vendorName: string) => {
    return thirdPartyInvoices.filter(
      invoice => invoice.thirdParty && invoice.thirdParty.company === vendorName
    );
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    toast({
      title: "Invoice Selected",
      description: `Viewing invoice ${invoice.invoiceNumber}`
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Third-Party Management</h1>
            <p className="text-muted-foreground">
              Manage third-party vendors and their invoices
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <ThirdPartyInvoiceForm
              projects={projects}
              invoices={invoices}
              onSubmit={handleCreateThirdPartyInvoice}
              className="w-full sm:w-auto"
            />
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={handleAddVendor}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="vendors">
          <TabsList>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vendors" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Vendor List</h2>
              <div className="w-72">
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor Name</TableHead>
                      <TableHead>Contact Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total Invoiced</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map((vendor) => (
                      <TableRow 
                        key={vendor.id}
                        className="cursor-pointer"
                        onClick={() => handleVendorClick(vendor)}
                      >
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell>{vendor.contactEmail}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              vendor.status === "active" 
                                ? "bg-aura-green/10 text-aura-green hover:bg-aura-green/20" 
                                : "bg-aura-gray/10 text-aura-gray hover:bg-aura-gray/20"
                            }
                          >
                            {vendor.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(vendor.totalInvoiced)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredVendors.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No vendors found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="invoices" className="mt-4">
            <InvoiceList 
              invoices={thirdPartyInvoices} 
              title="Third-Party Invoices"
              onClick={handleInvoiceClick}
            />
            {thirdPartyInvoices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No third-party invoices yet. Create one to get started.
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Dialog open={showVendorDialog} onOpenChange={setShowVendorDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
              <DialogDescription>
                Add a new third-party vendor to your list.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vendor Name</Label>
                <Input 
                  id="name" 
                  value={newVendor.name}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={newVendor.contactEmail}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="contact@example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowVendorDialog(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmitVendor}>
                Add Vendor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ThirdParty;
