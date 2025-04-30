import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectCard from '@/components/ProjectCard';
import { Project } from '@/lib/dbService';
import ProjectDetail from '@/components/ProjectDetail';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, HardDrive, Wrench, LayoutGrid, List, Calendar, CalendarCheck, CalendarX, CreditCard } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useProjects } from '@/context/ProjectsContext';
import { useSettings } from '@/context/SettingsContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from '@/lib/utils';

const Projects = () => {
  const { toast } = useToast();
  const { projects, invoices, createProject, loading } = useProjects();
  const { formatCurrency, formatDate } = useSettings();
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    status: 'active' as 'active' | 'completed' | 'pending',
    budget: 0,
    splitBudget: false,
    hardwareBudget: 0,
    serviceBudget: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
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
    currentPo: undefined as 'hardware' | 'software' | 'combined' | undefined,
    activePOs: [] as ('hardware' | 'software' | 'combined')[]
  });

  const handleCreateProject = () => {
    setShowNewProjectDialog(true);
  };
  
  const handleSubmitProject = async () => {
    try {
      // Validate required fields
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
      
      // Create the new project object
      const project = {
        name: newProject.name,
        client: newProject.client,
        status: newProject.status,
        budget: totalBudget,
        invoiced: 0,
        startDate: newProject.startDate,
        endDate: newProject.endDate,
        invoiceCount: 0,
        poNumbers: newProject.poNumbers,
        activePOs: newProject.activePOs.length > 0 ? newProject.activePOs : undefined,
        ...(newProject.currentPo && { currentPo: newProject.currentPo }),
        ...(newProject.splitBudget && {
          hardwareBudget: Number(newProject.hardwareBudget),
          serviceBudget: Number(newProject.serviceBudget),
          hardwareInvoiced: 0,
          serviceInvoiced: 0
        }),
        ...(newProject.gstEnabled && {
          gstPercentage: newProject.customGst ? Number(newProject.gstPercentage) : 18
        }),
        ...(newProject.tdsEnabled && {
          tdsPercentage: newProject.customTds ? Number(newProject.tdsPercentage) : 2
        })
      };
      
      // Add GST and TDS data if enabled
      if (newProject.gstEnabled) {
        Object.assign(project, {
          gstEnabled: true,
          ...(newProject.customGst && { gstPercentage: Number(newProject.gstPercentage) })
        });
      }
      
      if (newProject.tdsEnabled) {
        Object.assign(project, {
          tdsEnabled: true,
          ...(newProject.customTds && { tdsPercentage: Number(newProject.tdsPercentage) })
        });
      }
      
      // Create the project
      await createProject(project);
      setShowNewProjectDialog(false);
      
      // Reset form
      setNewProject({
        name: '',
        client: '',
        status: 'active' as 'active' | 'completed' | 'pending',
        budget: 0,
        splitBudget: false,
        hardwareBudget: 0,
        serviceBudget: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
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
        currentPo: undefined,
        activePOs: []
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while creating the project.",
        variant: "destructive"
      });
    }
  };
  
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };
  
  const handleCreateInvoiceForProject = () => {
    // This would open the invoice form with the project pre-selected
    if (selectedProject) {
      toast({
        title: "Create Invoice",
        description: `Creating invoice for ${selectedProject.name}`,
      });
      
      // Close the project detail dialog
      setSelectedProject(null);
    }
  };

  // Helper functions for both views
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active':
        return 'bg-aura-green/20 text-aura-green border-aura-green/50';
      case 'completed':
        return 'bg-aura-blue/20 text-aura-blue border-aura-blue/50';
      case 'pending':
        return 'bg-aura-orange/20 text-aura-orange border-aura-orange/50';
      default:
        return 'bg-aura-gray/20 text-aura-gray border-aura-gray/50';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress > 90) return 'bg-aura-red';
    if (progress > 75) return 'bg-aura-orange';
    return 'bg-aura-green';
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
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage all your client projects
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'list' | 'card')}>
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="card" aria-label="Card view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button onClick={handleCreateProject} className="w-full md:w-auto">
              <PlusCircle className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active Projects</TabsTrigger>
            <TabsTrigger value="completed">Completed Projects</TabsTrigger>
            <TabsTrigger value="all">All Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-4">
            {viewMode === 'card' ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects
                  .filter(project => project.status === "active")
                  .map((project, index) => (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      onClick={() => handleProjectClick(project)}
                      className={`[animation-delay:${index * 100}ms]`}
                    />
                  ))}
                {projects.filter(project => project.status === "active").length === 0 && (
                  <div className="col-span-3 text-center py-10 text-muted-foreground">
                    No active projects. Create a new project to get started.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Invoiced</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead>PO</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects
                      .filter(project => project.status === "active")
                      .map((project) => {
                        const progress = project.budget ? Math.min(100, Math.round((project.invoiced / project.budget) * 100)) : 0;
                        const remaining = project.budget - project.invoiced;
                        return (
                          <TableRow 
                            key={project.id}
                            className="cursor-pointer hover:bg-muted/80"
                            onClick={() => handleProjectClick(project)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {project.name}
                                <Badge variant="outline" className={cn(getStatusColor(project.status), "capitalize")}>
                                  {project.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>{project.client}</TableCell>
                            <TableCell>{formatCurrency(project.budget)}</TableCell>
                            <TableCell>{formatCurrency(project.invoiced)}</TableCell>
                            <TableCell>{formatCurrency(remaining)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={progress} className={cn("h-2 w-20", getProgressColor(progress))} />
                                <span className="text-xs">{progress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(project.startDate)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {project.status === 'completed' ? (
                                  <CalendarCheck className="h-4 w-4 text-aura-green" />
                                ) : new Date(project.endDate) < new Date() ? (
                                  <CalendarX className="h-4 w-4 text-aura-red" />
                                ) : (
                                  <Calendar className="h-4 w-4" />
                                )}
                                <span>{formatDate(project.endDate)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                {project.gstEnabled && <span>GST {project.gstPercentage || 18}%</span>}
                                {project.gstEnabled && project.tdsEnabled && <span> • </span>}
                                {project.tdsEnabled && <span>TDS {project.tdsPercentage || 2}%</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              {project.currentPo && project.poNumbers && project.poNumbers[project.currentPo] && (
                                <div className="flex items-center gap-1 text-xs">
                                  <CreditCard className="h-3 w-3" />
                                  <span>{project.poNumbers[project.currentPo]}</span>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {projects.filter(project => project.status === "active").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                          No active projects. Create a new project to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            {viewMode === 'card' ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects
                  .filter(project => project.status === "completed")
                  .map((project, index) => (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      onClick={() => handleProjectClick(project)}
                      className={`[animation-delay:${index * 100}ms]`}
                    />
                  ))}
                {projects.filter(project => project.status === "completed").length === 0 && (
                  <div className="col-span-3 text-center py-10 text-muted-foreground">
                    No completed projects yet.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Invoiced</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead>PO</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects
                      .filter(project => project.status === "completed")
                      .map((project) => {
                        const progress = project.budget ? Math.min(100, Math.round((project.invoiced / project.budget) * 100)) : 0;
                        const remaining = project.budget - project.invoiced;
                        return (
                          <TableRow 
                            key={project.id}
                            className="cursor-pointer hover:bg-muted/80"
                            onClick={() => handleProjectClick(project)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {project.name}
                                <Badge variant="outline" className={cn(getStatusColor(project.status), "capitalize")}>
                                  {project.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>{project.client}</TableCell>
                            <TableCell>{formatCurrency(project.budget)}</TableCell>
                            <TableCell>{formatCurrency(project.invoiced)}</TableCell>
                            <TableCell>{formatCurrency(remaining)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={progress} className={cn("h-2 w-20", getProgressColor(progress))} />
                                <span className="text-xs">{progress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(project.startDate)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {project.status === 'completed' ? (
                                  <CalendarCheck className="h-4 w-4 text-aura-green" />
                                ) : new Date(project.endDate) < new Date() ? (
                                  <CalendarX className="h-4 w-4 text-aura-red" />
                                ) : (
                                  <Calendar className="h-4 w-4" />
                                )}
                                <span>{formatDate(project.endDate)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                {project.gstEnabled && <span>GST {project.gstPercentage || 18}%</span>}
                                {project.gstEnabled && project.tdsEnabled && <span> • </span>}
                                {project.tdsEnabled && <span>TDS {project.tdsPercentage || 2}%</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              {project.currentPo && project.poNumbers && project.poNumbers[project.currentPo] && (
                                <div className="flex items-center gap-1 text-xs">
                                  <CreditCard className="h-3 w-3" />
                                  <span>{project.poNumbers[project.currentPo]}</span>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {projects.filter(project => project.status === "completed").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                          No completed projects yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="mt-4">
            {viewMode === 'card' ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project, index) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onClick={() => handleProjectClick(project)}
                    className={`[animation-delay:${index * 100}ms]`}
                  />
                ))}
                {projects.length === 0 && (
                  <div className="col-span-3 text-center py-10 text-muted-foreground">
                    No projects yet. Create a new project to get started.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Invoiced</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead>PO</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => {
                      const progress = project.budget ? Math.min(100, Math.round((project.invoiced / project.budget) * 100)) : 0;
                      const remaining = project.budget - project.invoiced;
                      return (
                        <TableRow 
                          key={project.id}
                          className="cursor-pointer hover:bg-muted/80"
                          onClick={() => handleProjectClick(project)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {project.name}
                              <Badge variant="outline" className={cn(getStatusColor(project.status), "capitalize")}>
                                {project.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{project.client}</TableCell>
                          <TableCell>{formatCurrency(project.budget)}</TableCell>
                          <TableCell>{formatCurrency(project.invoiced)}</TableCell>
                          <TableCell>{formatCurrency(remaining)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={progress} className={cn("h-2 w-20", getProgressColor(progress))} />
                              <span className="text-xs">{progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(project.startDate)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {project.status === 'completed' ? (
                                <CalendarCheck className="h-4 w-4 text-aura-green" />
                              ) : new Date(project.endDate) < new Date() ? (
                                <CalendarX className="h-4 w-4 text-aura-red" />
                              ) : (
                                <Calendar className="h-4 w-4" />
                              )}
                              <span>{formatDate(project.endDate)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              {project.gstEnabled && <span>GST {project.gstPercentage || 18}%</span>}
                              {project.gstEnabled && project.tdsEnabled && <span> • </span>}
                              {project.tdsEnabled && <span>TDS {project.tdsPercentage || 2}%</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            {project.currentPo && project.poNumbers && project.poNumbers[project.currentPo] && (
                              <div className="flex items-center gap-1 text-xs">
                                <CreditCard className="h-3 w-3" />
                                <span>{project.poNumbers[project.currentPo]}</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {projects.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                          No projects yet. Create a new project to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Project Detail Dialog */}
      {selectedProject && (
        <ProjectDetail 
          project={selectedProject}
          invoices={invoices.filter(invoice => invoice.projectId === selectedProject.id)}
          open={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onCreateInvoice={handleCreateInvoiceForProject}
        />
      )}
      
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
                <Label htmlFor="projectSplitBudget">Budget Type</Label>
              </div>
              <div className="col-span-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="projectSplitBudget" 
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
                  <Label htmlFor="projectSplitBudget" className="font-normal cursor-pointer">
                    Split budget between Hardware and Service
                  </Label>
                </div>
              </div>
            </div>
            
            {!newProject.splitBudget ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="budget" className="text-right">
                  Budget
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="budget"
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({...newProject, budget: Number(e.target.value)})}
                    className="flex-1"
                  />
                </div>
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
                    <Label htmlFor="projectActivePOs" className="text-sm mb-1 block">Active PO(s)</Label>
                    <div className="space-y-2">
                      {newProject.poNumbers.hardware && (
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="active-hardware-po" 
                            checked={newProject.activePOs.includes('hardware')}
                            onCheckedChange={(checked) => {
                              const newActivePOs = [...newProject.activePOs];
                              if (checked) {
                                if (!newActivePOs.includes('hardware')) {
                                  newActivePOs.push('hardware');
                                }
                              } else {
                                const index = newActivePOs.indexOf('hardware');
                                if (index !== -1) {
                                  newActivePOs.splice(index, 1);
                                }
                              }
                              setNewProject({...newProject, activePOs: newActivePOs, currentPo: undefined});
                            }}
                          />
                          <Label htmlFor="active-hardware-po" className="font-normal">Hardware PO</Label>
                        </div>
                      )}
                      {newProject.poNumbers.software && (
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="active-services-po" 
                            checked={newProject.activePOs.includes('software')}
                            onCheckedChange={(checked) => {
                              const newActivePOs = [...newProject.activePOs];
                              if (checked) {
                                if (!newActivePOs.includes('software')) {
                                  newActivePOs.push('software');
                                }
                              } else {
                                const index = newActivePOs.indexOf('software');
                                if (index !== -1) {
                                  newActivePOs.splice(index, 1);
                                }
                              }
                              setNewProject({...newProject, activePOs: newActivePOs, currentPo: undefined});
                            }}
                          />
                          <Label htmlFor="active-services-po" className="font-normal">Services PO</Label>
                        </div>
                      )}
                      {newProject.poNumbers.combined && (
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="active-combined-po" 
                            checked={newProject.activePOs.includes('combined')}
                            onCheckedChange={(checked) => {
                              const newActivePOs = [...newProject.activePOs];
                              if (checked) {
                                if (!newActivePOs.includes('combined')) {
                                  newActivePOs.push('combined');
                                }
                              } else {
                                const index = newActivePOs.indexOf('combined');
                                if (index !== -1) {
                                  newActivePOs.splice(index, 1);
                                }
                              }
                              setNewProject({...newProject, activePOs: newActivePOs, currentPo: undefined});
                            }}
                          />
                          <Label htmlFor="active-combined-po" className="font-normal">Combined PO</Label>
                        </div>
                      )}
                    </div>
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
    </Layout>
  );
};

export default Projects;
