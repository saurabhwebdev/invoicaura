import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useProjects } from '@/context/ProjectsContext';
import { vendorService, Vendor } from '@/lib/dbService';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ThirdPartyInvoiceForm from '@/components/ThirdPartyInvoiceForm';
import InvoiceList, { Invoice } from '@/components/InvoiceList';

const VendorManagement = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { formatCurrency } = useSettings();
  const { projects, invoices, createThirdPartyInvoice } = useProjects();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Load vendors when component mounts
  useEffect(() => {
    loadVendors();
  }, [currentUser]);

  const loadVendors = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const userVendors = await vendorService.getVendors(currentUser);
      setVendors(userVendors);
    } catch (error: any) {
      console.error("Error loading vendors:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load vendors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get third-party invoices
  const thirdPartyInvoices = invoices.filter(invoice => invoice.thirdParty);
  
  // Update vendor totals based on actual invoices
  useEffect(() => {
    if (!currentUser || loading) return;
    
    // Calculate vendor totals from actual invoices
    const vendorTotals = thirdPartyInvoices.reduce((acc, invoice) => {
      if (invoice.thirdParty && invoice.thirdParty.company) {
        const company = invoice.thirdParty.company;
        acc[company] = (acc[company] || 0) + invoice.thirdParty.amount;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Update vendor totals in Firebase
    const updateVendorTotals = async () => {
      for (const [vendorName, total] of Object.entries(vendorTotals)) {
        try {
          // Find if the vendor exists in our state
          const existingVendor = vendors.find(v => v.name === vendorName);
          
          if (existingVendor) {
            // Only update if the total has changed
            if (existingVendor.totalInvoiced !== total) {
              const updated = await vendorService.updateVendor(currentUser, existingVendor.id, {
                totalInvoiced: total
              });
              
              // Update local state
              setVendors(prev => 
                prev.map(v => v.id === updated.id ? updated : v)
              );
            }
          } else {
            // Create a new vendor with the calculated total
            const newVendor = await vendorService.createVendor(currentUser, {
              name: vendorName,
              contactEmail: '',
              status: 'active',
              totalInvoiced: total
            });
            
            // Add to local state
            setVendors(prev => [...prev, newVendor]);
          }
        } catch (error) {
          console.error(`Error updating vendor ${vendorName}:`, error);
        }
      }
    };
    
    updateVendorTotals();
  }, [currentUser, thirdPartyInvoices, vendors, loading]);

  const handleOpenCreateDialog = () => {
    setFormData({
      name: '',
      contactEmail: '',
      status: 'active',
    });
    setSelectedVendor(null);
    setShowVendorDialog(true);
  };

  const handleOpenEditDialog = (vendor: Vendor) => {
    setFormData({
      name: vendor.name,
      contactEmail: vendor.contactEmail,
      status: vendor.status,
    });
    setSelectedVendor(vendor);
    setShowVendorDialog(true);
  };

  const handleDeleteVendor = async () => {
    if (!currentUser || !confirmDelete) return;
    
    try {
      await vendorService.deleteVendor(currentUser, confirmDelete);
      
      // Update local state
      setVendors(prevVendors => prevVendors.filter(v => v.id !== confirmDelete));
      
      toast({
        title: "Success",
        description: "Vendor deleted successfully"
      });
    } catch (error: any) {
      console.error("Error deleting vendor:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete vendor",
        variant: "destructive"
      });
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleFormSubmit = async () => {
    if (!currentUser) return;
    
    // Form validation
    if (!formData.name) {
      toast({
        title: "Missing Information",
        description: "Vendor name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (selectedVendor) {
        // Update existing vendor
        const updatedVendor = await vendorService.updateVendor(
          currentUser, 
          selectedVendor.id, 
          formData
        );
        
        // Update local state
        setVendors(prevVendors => 
          prevVendors.map(v => v.id === updatedVendor.id ? updatedVendor : v)
        );
        
        toast({
          title: "Success",
          description: "Vendor updated successfully"
        });
      } else {
        // Create new vendor
        const newVendor = await vendorService.createVendor(
          currentUser, 
          {
            ...formData,
            totalInvoiced: 0
          }
        );
        
        // Add to local state
        setVendors(prev => [...prev, newVendor]);
        
        toast({
          title: "Success",
          description: "Vendor created successfully"
        });
      }
      
      // Close dialog
      setShowVendorDialog(false);
    } catch (error: any) {
      console.error("Error submitting vendor:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save vendor",
        variant: "destructive"
      });
    }
  };

  const handleCreateThirdPartyInvoice = async (thirdPartyData: any) => {
    if (!currentUser) return;
    
    try {
      // Create the invoice
      await createThirdPartyInvoice(thirdPartyData);
      
      // Find the vendor
      const vendorName = thirdPartyData.company;
      const existingVendor = vendors.find(v => v.name === vendorName);
      
      if (existingVendor) {
        // Update the vendor's total
        const newTotal = existingVendor.totalInvoiced + thirdPartyData.amount;
        const updated = await vendorService.updateVendor(currentUser, existingVendor.id, {
          totalInvoiced: newTotal
        });
        
        // Update local state
        setVendors(prev => 
          prev.map(v => v.id === updated.id ? updated : v)
        );
      } else {
        // Create a new vendor
        const newVendor = await vendorService.createVendor(currentUser, {
          name: vendorName,
          contactEmail: '',
          status: 'active',
          totalInvoiced: thirdPartyData.amount
        });
        
        // Add to local state
        setVendors(prev => [...prev, newVendor]);
      }

      toast({
        title: "Third-Party Invoice Added",
        description: `Invoice from ${thirdPartyData.company} has been added successfully.`
      });
    } catch (error: any) {
      console.error("Error with third-party invoice:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process third-party invoice",
        variant: "destructive"
      });
    }
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    toast({
      title: "Invoice Selected",
      description: `Viewing invoice ${invoice.invoiceNumber}`
    });
  };

  // Filter vendors by search term
  const filteredVendors = vendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get vendor invoices for a specific vendor
  const getVendorInvoices = (vendorName: string) => {
    return thirdPartyInvoices.filter(
      invoice => invoice.thirdParty && invoice.thirdParty.company === vendorName
    );
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
            <h1 className="text-3xl font-bold tracking-tight">Vendor Management</h1>
            <p className="text-muted-foreground">
              Manage your vendors and third-party invoices
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <ThirdPartyInvoiceForm
              projects={projects}
              invoices={invoices}
              onSubmit={handleCreateThirdPartyInvoice}
              className="w-full sm:w-auto"
            />
            <Button onClick={handleOpenCreateDialog} className="w-full md:w-auto">
              <PlusCircle className="w-4 h-4 mr-2" />
              New Vendor
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="vendors">
          <TabsList>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="active">Active Vendors</TabsTrigger>
            <TabsTrigger value="inactive">Inactive Vendors</TabsTrigger>
            <TabsTrigger value="invoices">Third-Party Invoices</TabsTrigger>
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
            
            <VendorTable 
              vendors={filteredVendors} 
              onEdit={handleOpenEditDialog} 
              onDelete={(id) => setConfirmDelete(id)} 
              formatCurrency={formatCurrency}
            />
          </TabsContent>
          
          <TabsContent value="active" className="mt-4">
            <VendorTable 
              vendors={vendors.filter(v => v.status === 'active')} 
              onEdit={handleOpenEditDialog} 
              onDelete={(id) => setConfirmDelete(id)} 
              formatCurrency={formatCurrency}
            />
          </TabsContent>
          
          <TabsContent value="inactive" className="mt-4">
            <VendorTable 
              vendors={vendors.filter(v => v.status === 'inactive')} 
              onEdit={handleOpenEditDialog} 
              onDelete={(id) => setConfirmDelete(id)} 
              formatCurrency={formatCurrency}
            />
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
      </div>
      
      {/* Vendor Form Dialog */}
      <Dialog open={showVendorDialog} onOpenChange={setShowVendorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedVendor ? 'Edit Vendor' : 'Create New Vendor'}
            </DialogTitle>
            <DialogDescription>
              {selectedVendor 
                ? 'Update the vendor information' 
                : 'Enter the details for your new vendor'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Vendor Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactEmail" className="text-right">
                Contact Email
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value as 'active' | 'inactive'})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVendorDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleFormSubmit}>
              {selectedVendor ? 'Update Vendor' : 'Create Vendor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vendor
              and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVendor} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

// VendorTable component
interface VendorTableProps {
  vendors: Vendor[];
  onEdit: (vendor: Vendor) => void;
  onDelete: (id: string) => void;
  formatCurrency: (amount: number) => string;
}

const VendorTable = ({ vendors, onEdit, onDelete, formatCurrency }: VendorTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendors</CardTitle>
      </CardHeader>
      <CardContent>
        {vendors.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No vendors found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Invoiced</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.contactEmail}</TableCell>
                  <TableCell>
                    <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                      {vendor.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(vendor.totalInvoiced)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(vendor)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(vendor.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorManagement; 