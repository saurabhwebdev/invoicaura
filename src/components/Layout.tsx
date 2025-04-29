import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { 
  Home, 
  FileText, 
  CreditCard, 
  Settings, 
  PlusCircle, 
  Menu,
  Receipt,
  LogOut,
  Plus,
  File,
  UserPlus,
  BarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjects } from '@/context/ProjectsContext';
import InvoiceForm from "@/components/InvoiceForm";

interface SidebarNavProps {
  className?: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { projects, createProject, createInvoice } = useProjects();
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    budget: 0,
    startDate: '',
    endDate: ''
  });
  
  // Set active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/") return "dashboard";
    if (path === "/projects") return "projects";
    if (path === "/invoices") return "invoices";
    if (path === "/third-party") return "thirdParty";
    if (path === "/settings") return "settings";
    return "dashboard";
  };
  
  const activeTab = getActiveTab();

  const handleTabClick = (tab: string) => {
    let path = "/";
    
    switch (tab) {
      case "dashboard":
        path = "/";
        break;
      case "projects":
        path = "/projects";
        break;
      case "invoices":
        path = "/invoices";
        break;
      case "thirdParty":
        path = "/third-party";
        break;
      case "settings":
        path = "/settings";
        break;
      default:
        path = "/";
    }
    
    navigate(path);
  };

  const handleCreateProject = () => {
    setShowNewProjectDialog(true);
  };

  const handleSubmitProject = () => {
    // Validation
    if (!newProject.name || !newProject.client || !newProject.budget || !newProject.startDate || !newProject.endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Create new project
    createProject({
      name: newProject.name,
      client: newProject.client,
      budget: Number(newProject.budget),
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      status: "active"
    });
    
    setShowNewProjectDialog(false);
    
    // Reset form
    setNewProject({
      name: '',
      client: '',
      budget: 0,
      startDate: '',
      endDate: ''
    });
  };

  const handleCreateInvoice = (invoice: any) => {
    createInvoice(invoice);
    toast({
      title: "Invoice Created",
      description: `Invoice #${invoice.invoiceNumber} has been created successfully.`
    });
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="px-2 py-6">
        <h2 className="px-4 mb-2 text-lg font-semibold tracking-tight aura-text-gradient">
          InvoiceAura
        </h2>
        <div className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start animate-slide-in [animation-delay:0ms]",
              activeTab === "dashboard" && "bg-accent"
            )}
            onClick={() => handleTabClick("dashboard")}
          >
            <Home className="w-5 h-5 mr-2" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start animate-slide-in [animation-delay:50ms]",
              activeTab === "projects" && "bg-accent"
            )}
            onClick={() => handleTabClick("projects")}
          >
            <FileText className="w-5 h-5 mr-2" />
            Projects
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start animate-slide-in [animation-delay:100ms]",
              activeTab === "invoices" && "bg-accent"
            )}
            onClick={() => handleTabClick("invoices")}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Invoices
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start animate-slide-in [animation-delay:125ms]",
              activeTab === "thirdParty" && "bg-accent"
            )}
            onClick={() => handleTabClick("thirdParty")}
          >
            <Receipt className="w-5 h-5 mr-2" />
            Third-Party
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start animate-slide-in [animation-delay:150ms]",
              activeTab === "settings" && "bg-accent"
            )}
            onClick={() => handleTabClick("settings")}
          >
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </Button>
        </div>
      </div>
      <Separator />
      <div className="flex-1"></div>
      <div className="px-2 py-4 space-y-2">
        <Button onClick={handleCreateProject} className="w-full gap-2 transition-all hover:gap-3" variant="default">
          <PlusCircle className="w-4 h-4" />
          <span>New Project</span>
        </Button>
        <InvoiceForm 
          projects={projects} 
          onSubmit={handleCreateInvoice}
          className="w-full border border-primary"
        />
        <Button onClick={() => setShowNewClientDialog(true)} variant="secondary" className="w-full gap-2 transition-all hover:gap-3 border border-secondary">
          <UserPlus className="w-4 h-4" />
          <span>New Client</span>
        </Button>
        <Button onClick={() => navigate("/")} variant="destructive" className="w-full gap-2 transition-all hover:gap-3 border border-destructive bg-opacity-80 hover:bg-opacity-100">
          <BarChart className="w-4 h-4" />
          <span>Reports</span>
        </Button>
      </div>

      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Enter the details for your new project.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Project Name
              </Label>
              <Input
                id="name"
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">
                Client
              </Label>
              <Input
                id="client"
                value={newProject.client}
                onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">
                Budget
              </Label>
              <Input
                id="budget"
                type="number"
                value={newProject.budget}
                onChange={(e) => setNewProject({...newProject, budget: Number(e.target.value)})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={newProject.startDate}
                onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={newProject.endDate}
                onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" onClick={handleSubmitProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Client Dialog Placeholder */}
      <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Enter the details for your new client.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientName" className="text-right">
                Client Name
              </Label>
              <Input
                id="clientName"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" onClick={() => {
              toast({
                title: "Client Added",
                description: "New client has been added successfully"
              });
              setShowNewClientDialog(false);
            }}>Add Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logOut } = useAuth();
  const { toast } = useToast();
  const { projects, createInvoice } = useProjects();
  
  const handleNewInvoiceClick = () => {
    navigate("/invoices");
  };

  const handleCreateInvoice = (invoice: any) => {
    createInvoice(invoice);
    toast({
      title: "Invoice Created",
      description: `Invoice #${invoice.invoiceNumber} has been created successfully.`
    });
  };

  const handleLogout = async () => {
    try {
      await logOut();
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase();
    }
    
    if (currentUser?.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-background fixed left-0 top-0 z-30">
          <SidebarNav />
        </aside>
        <main className="flex-1 md:ml-64">
          <div className="flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 sticky top-0 z-10">
            <div className="flex items-center md:hidden">
              <SidebarTrigger>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SidebarTrigger>
              <h2 className="ml-3 text-lg font-semibold tracking-tight aura-text-gradient">
                InvoiceAura
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <InvoiceForm 
                  projects={projects} 
                  onSubmit={handleCreateInvoice}
                  className="border border-primary"
                />
              </div>
              <Button variant="outline" size="icon" className="md:hidden" onClick={handleNewInvoiceClick}>
                <PlusCircle className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-9 w-9 cursor-pointer">
                    <AvatarImage src={currentUser?.photoURL || ""} alt="User" />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {currentUser?.displayName || currentUser?.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="container mx-auto py-6 px-4 md:px-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
