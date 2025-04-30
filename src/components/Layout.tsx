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
  BarChart,
  HardDrive,
  Wrench,
  Truck
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
import { Checkbox } from "@/components/ui/checkbox";
import { useSettings } from '@/context/SettingsContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    endDate: '',
    splitBudget: false,
    hardwareBudget: 0,
    serviceBudget: 0,
    gstEnabled: false,
    gstPercentage: 18,
    customGst: false,
    tdsEnabled: false,
    tdsPercentage: 2,
    customTds: false,
    poNumbers: {
      hardware: '',
      software: '',
      combined: ''
    },
    currentPo: undefined as 'hardware' | 'software' | 'combined' | undefined
  });
  const { formatCurrency } = useSettings();
  
  // Set active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/") return "dashboard";
    if (path === "/projects") return "projects";
    if (path === "/vendors") return "vendors";
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
      case "vendors":
        path = "/vendors";
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
    if (!newProject.name || !newProject.client || !newProject.startDate || !newProject.endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate budget
    if (!newProject.splitBudget && !newProject.budget) {
      toast({
        title: "Missing Budget",
        description: "Please enter a total budget for the project.",
        variant: "destructive"
      });
      return;
    }
    
    if (newProject.splitBudget && (!newProject.hardwareBudget || !newProject.serviceBudget)) {
      toast({
        title: "Missing Budget Details",
        description: "Please enter both hardware and service budgets.",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate the total budget when split
    const totalBudget = newProject.splitBudget 
      ? Number(newProject.hardwareBudget) + Number(newProject.serviceBudget)
      : Number(newProject.budget);
    
    // Create project data
    const projectData = {
      name: newProject.name,
      client: newProject.client,
      budget: totalBudget,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      status: "active" as 'active' | 'completed' | 'pending',
      gstEnabled: newProject.gstEnabled,
      tdsEnabled: newProject.tdsEnabled,
      poNumbers: newProject.poNumbers,
      currentPo: newProject.currentPo
    };
    
    // Add split budget data if enabled
    if (newProject.splitBudget) {
      Object.assign(projectData, {
        hardwareBudget: Number(newProject.hardwareBudget),
        serviceBudget: Number(newProject.serviceBudget),
        hardwareInvoiced: 0,
        serviceInvoiced: 0
      });
    }
    
    // Add GST and TDS data if enabled
    if (newProject.gstEnabled) {
      Object.assign(projectData, {
        gstPercentage: newProject.customGst ? Number(newProject.gstPercentage) : 18
      });
    }
    
    if (newProject.tdsEnabled) {
      Object.assign(projectData, {
        tdsPercentage: newProject.customTds ? Number(newProject.tdsPercentage) : 2
      });
    }
    
    // Create the project
    createProject(projectData);
    setShowNewProjectDialog(false);
    
    // Reset form
    setNewProject({
      name: '',
      client: '',
      budget: 0,
      startDate: '',
      endDate: '',
      splitBudget: false,
      hardwareBudget: 0,
      serviceBudget: 0,
      gstEnabled: false,
      gstPercentage: 18,
      customGst: false,
      tdsEnabled: false,
      tdsPercentage: 2,
      customTds: false,
      poNumbers: {
        hardware: '',
        software: '',
        combined: ''
      },
      currentPo: undefined
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
              "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-300",
              activeTab === "dashboard" 
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300" 
                : ""
            )}
            onClick={() => handleTabClick("dashboard")}
          >
            <Home className={cn(
              "w-5 h-5 mr-2",
              activeTab === "dashboard" 
                ? "text-blue-500 dark:text-blue-300" 
                : "text-blue-400 dark:text-blue-400/70"
            )} />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start animate-slide-in [animation-delay:50ms]",
              "hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300",
              activeTab === "projects" 
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300" 
                : ""
            )}
            onClick={() => handleTabClick("projects")}
          >
            <FileText className={cn(
              "w-5 h-5 mr-2",
              activeTab === "projects" 
                ? "text-emerald-500 dark:text-emerald-300" 
                : "text-emerald-400 dark:text-emerald-400/70"
            )} />
            Projects
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start animate-slide-in [animation-delay:75ms]",
              "hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/30 dark:hover:text-purple-300",
              activeTab === "vendors" 
                ? "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300" 
                : ""
            )}
            onClick={() => handleTabClick("vendors")}
          >
            <Truck className={cn(
              "w-5 h-5 mr-2",
              activeTab === "vendors" 
                ? "text-purple-500 dark:text-purple-300" 
                : "text-purple-400 dark:text-purple-400/70"
            )} />
            Vendors
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start animate-slide-in [animation-delay:100ms]",
              "hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-900/30 dark:hover:text-violet-300",
              activeTab === "invoices" 
                ? "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300" 
                : ""
            )}
            onClick={() => handleTabClick("invoices")}
          >
            <CreditCard className={cn(
              "w-5 h-5 mr-2",
              activeTab === "invoices" 
                ? "text-violet-500 dark:text-violet-300" 
                : "text-violet-400 dark:text-violet-400/70"
            )} />
            Invoices
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start animate-slide-in [animation-delay:125ms]",
              "hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30 dark:hover:text-amber-300",
              activeTab === "thirdParty" 
                ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300" 
                : ""
            )}
            onClick={() => handleTabClick("thirdParty")}
          >
            <Receipt className={cn(
              "w-5 h-5 mr-2",
              activeTab === "thirdParty" 
                ? "text-amber-500 dark:text-amber-300" 
                : "text-amber-400 dark:text-amber-400/70"
            )} />
            Third-Party
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start animate-slide-in [animation-delay:150ms]",
              "hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800/60 dark:hover:text-slate-300",
              activeTab === "settings" 
                ? "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300" 
                : ""
            )}
            onClick={() => handleTabClick("settings")}
          >
            <Settings className={cn(
              "w-5 h-5 mr-2",
              activeTab === "settings" 
                ? "text-slate-500 dark:text-slate-300" 
                : "text-slate-400 dark:text-slate-400/70"
            )} />
            Settings
          </Button>
        </div>
      </div>
      <Separator />
      <div className="flex-1"></div>
      <div className="px-2 py-4 space-y-2">
        <Button 
          onClick={handleCreateProject} 
          className="w-full gap-2 transition-all hover:gap-3 bg-emerald-200 hover:bg-emerald-300 text-emerald-800 border-none" 
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Project</span>
        </Button>
        <InvoiceForm 
          projects={projects} 
          onSubmit={handleCreateInvoice}
          className="w-full border border-violet-200"
        />
        <Button 
          onClick={() => setShowNewClientDialog(true)} 
          className="w-full gap-2 transition-all hover:gap-3 bg-sky-200 hover:bg-sky-300 text-sky-800 border-none"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Client</span>
        </Button>
        <Button 
          onClick={() => navigate("/")} 
          className="w-full gap-2 transition-all hover:gap-3 bg-rose-200 hover:bg-rose-300 text-rose-800 border-none"
        >
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
              <div className="text-right">
                <Label htmlFor="splitBudget">Budget Type</Label>
              </div>
              <div className="col-span-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="splitBudget" 
                    checked={newProject.splitBudget}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        // When enabling split budget, set initial hardware and service based on current budget
                        const halfBudget = newProject.budget / 2;
                        setNewProject({
                          ...newProject, 
                          splitBudget: true,
                          hardwareBudget: halfBudget,
                          serviceBudget: halfBudget
                        });
                      } else {
                        // When disabling, set budget to the sum of hardware and service
                        setNewProject({
                          ...newProject, 
                          splitBudget: false,
                          budget: Number(newProject.hardwareBudget) + Number(newProject.serviceBudget)
                        });
                      }
                    }}
                  />
                  <Label htmlFor="splitBudget" className="font-normal cursor-pointer">
                    Split budget between Hardware and Service
                  </Label>
                </div>
              </div>
            </div>
            
            {!newProject.splitBudget ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="budget" className="text-right">
                  Total Budget
                </Label>
                <Input
                  id="budget"
                  type="number"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({...newProject, budget: Number(e.target.value)})}
                  className="col-span-3"
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="hardwareBudget" className="text-right flex items-center gap-1">
                    <HardDrive className="h-4 w-4 text-aura-blue" />
                    Hardware Budget
                  </Label>
                  <Input
                    id="hardwareBudget"
                    type="number"
                    value={newProject.hardwareBudget}
                    onChange={(e) => setNewProject({...newProject, hardwareBudget: Number(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="serviceBudget" className="text-right flex items-center gap-1">
                    <Wrench className="h-4 w-4 text-aura-purple" />
                    Service Budget
                  </Label>
                  <Input
                    id="serviceBudget"
                    type="number"
                    value={newProject.serviceBudget}
                    onChange={(e) => setNewProject({...newProject, serviceBudget: Number(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right text-sm text-muted-foreground">
                    Total Budget
                  </div>
                  <div className="col-span-3 font-medium">
                    {formatCurrency(Number(newProject.hardwareBudget) + Number(newProject.serviceBudget))}
                  </div>
                </div>
              </>
            )}
            
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

            {/* GST Section */}
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label htmlFor="projectGSTEnabled">GST</Label>
              </div>
              <div className="col-span-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="projectGSTEnabled" 
                    checked={newProject.gstEnabled}
                    onCheckedChange={(checked) => setNewProject({...newProject, gstEnabled: !!checked})}
                  />
                  <Label htmlFor="projectGSTEnabled" className="font-normal cursor-pointer">
                    Enable GST
                  </Label>
                </div>
              </div>
            </div>

            {newProject.gstEnabled && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right">
                    <Label htmlFor="projectCustomGST">GST Rate</Label>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="projectCustomGST" 
                        checked={newProject.customGst}
                        onCheckedChange={(checked) => {
                          const isCustom = !!checked;
                          setNewProject({
                            ...newProject, 
                            customGst: isCustom,
                            gstPercentage: isCustom ? newProject.gstPercentage : 18
                          });
                        }}
                      />
                      <Label htmlFor="projectCustomGST" className="font-normal cursor-pointer">
                        Custom GST rate
                      </Label>
                    </div>
                  </div>
                </div>

                {newProject.customGst ? (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="projectGSTPercentage" className="text-right">
                      GST Percentage
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <Input
                        id="projectGSTPercentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={newProject.gstPercentage}
                        onChange={(e) => setNewProject({...newProject, gstPercentage: Number(e.target.value)})}
                        className="flex-1"
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="text-right">
                      <Label>Standard Rate</Label>
                    </div>
                    <div className="col-span-3 text-muted-foreground">
                      18% GST
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TDS Section */}
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label htmlFor="projectTDSEnabled">TDS</Label>
              </div>
              <div className="col-span-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="projectTDSEnabled" 
                    checked={newProject.tdsEnabled}
                    onCheckedChange={(checked) => setNewProject({...newProject, tdsEnabled: !!checked})}
                  />
                  <Label htmlFor="projectTDSEnabled" className="font-normal cursor-pointer">
                    Enable TDS
                  </Label>
                </div>
              </div>
            </div>

            {newProject.tdsEnabled && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right">
                    <Label htmlFor="projectCustomTDS">TDS Rate</Label>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="projectCustomTDS" 
                        checked={newProject.customTds}
                        onCheckedChange={(checked) => {
                          const isCustom = !!checked;
                          setNewProject({
                            ...newProject, 
                            customTds: isCustom,
                            tdsPercentage: isCustom ? newProject.tdsPercentage : 2
                          });
                        }}
                      />
                      <Label htmlFor="projectCustomTDS" className="font-normal cursor-pointer">
                        Custom TDS rate
                      </Label>
                    </div>
                  </div>
                </div>

                {newProject.customTds ? (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="projectTDSPercentage" className="text-right">
                      TDS Percentage
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <Input
                        id="projectTDSPercentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={newProject.tdsPercentage}
                        onChange={(e) => setNewProject({...newProject, tdsPercentage: Number(e.target.value)})}
                        className="flex-1"
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="text-right">
                      <Label>Standard Rate</Label>
                    </div>
                    <div className="col-span-3 text-muted-foreground">
                      2% TDS
                    </div>
                  </div>
                )}
              </>
            )}

            {/* PO Information Section */}
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label>Purchase Orders</Label>
              </div>
              <div className="col-span-3">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="projectHardwarePo" className="text-sm mb-1 block">Hardware PO</Label>
                    <Input
                      id="projectHardwarePo"
                      value={newProject.poNumbers.hardware}
                      onChange={(e) => setNewProject({
                        ...newProject, 
                        poNumbers: {...newProject.poNumbers, hardware: e.target.value}
                      })}
                      placeholder="Hardware PO number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="projectServicesPo" className="text-sm mb-1 block">Services PO</Label>
                    <Input
                      id="projectServicesPo"
                      value={newProject.poNumbers.software}
                      onChange={(e) => setNewProject({
                        ...newProject, 
                        poNumbers: {...newProject.poNumbers, software: e.target.value}
                      })}
                      placeholder="Services PO number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="projectCombinedPo" className="text-sm mb-1 block">Combined PO</Label>
                    <Input
                      id="projectCombinedPo"
                      value={newProject.poNumbers.combined}
                      onChange={(e) => setNewProject({
                        ...newProject, 
                        poNumbers: {...newProject.poNumbers, combined: e.target.value}
                      })}
                      placeholder="Combined PO number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="projectCurrentPo" className="text-sm mb-1 block">Current Active PO</Label>
                    <Select 
                      value={newProject.currentPo} 
                      onValueChange={(value) => setNewProject({
                        ...newProject, 
                        currentPo: value as 'hardware' | 'software' | 'combined'
                      })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select active PO" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hardware">Hardware PO</SelectItem>
                        <SelectItem value="software">Services PO</SelectItem>
                        <SelectItem value="combined">Combined PO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
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
            <div className="flex items-center">
              <div className="md:hidden flex items-center">
                <SidebarTrigger>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SidebarTrigger>
                <h2 className="ml-3 text-lg font-semibold tracking-tight aura-text-gradient">
                  InvoiceAura
                </h2>
              </div>
              <div className="hidden md:block">
                <InvoiceForm 
                  projects={projects} 
                  onSubmit={handleCreateInvoice}
                  className="border-none"
                />
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="md:hidden bg-violet-100 hover:bg-violet-200 border-violet-200 text-violet-700" 
                onClick={handleNewInvoiceClick}
              >
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center">
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
