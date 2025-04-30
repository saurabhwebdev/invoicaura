import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectCard, { Project } from '@/components/ProjectCard';
import ProjectDetail from '@/components/ProjectDetail';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, HardDrive, Wrench } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useProjects } from '@/context/ProjectsContext';

const Projects = () => {
  const { toast } = useToast();
  const { projects, invoices, createProject, loading } = useProjects();
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    budget: 0,
    startDate: '',
    endDate: '',
    splitBudget: false,
    hardwareBudget: 0,
    serviceBudget: 0
  });

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
    
    // Create new project
    createProject({
      name: newProject.name,
      client: newProject.client,
      budget: totalBudget,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      status: "active",
      ...(newProject.splitBudget && {
        hardwareBudget: Number(newProject.hardwareBudget),
        serviceBudget: Number(newProject.serviceBudget),
        hardwareInvoiced: 0,
        serviceInvoiced: 0
      })
    });
    
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
      serviceBudget: 0
    });
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
          <Button onClick={handleCreateProject} className="w-full md:w-auto">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
        
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active Projects</TabsTrigger>
            <TabsTrigger value="completed">Completed Projects</TabsTrigger>
            <TabsTrigger value="all">All Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-4">
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
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
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
          </TabsContent>
          
          <TabsContent value="all" className="mt-4">
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
                    ${(Number(newProject.hardwareBudget) + Number(newProject.serviceBudget)).toLocaleString()}
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
