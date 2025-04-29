import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from '@/lib/utils';
import { CalendarCheck, CalendarX, Calendar } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export interface Project {
  id: string;
  name: string;
  client: string;
  budget: number;
  invoiced: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending';
  invoiceCount: number;
}

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  className?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, className }) => {
  const { formatCurrency, formatDate } = useSettings();
  
  const progress = project.budget ? Math.min(100, Math.round((project.invoiced / project.budget) * 100)) : 0;
  const remaining = project.budget - project.invoiced;
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active':
        return 'bg-green-500/20 text-green-600 border-green-500/50';
      case 'completed':
        return 'bg-blue-500/20 text-blue-600 border-blue-500/50';
      case 'pending':
        return 'bg-amber-500/20 text-amber-600 border-amber-500/50';
      default:
        return 'bg-slate-500/20 text-slate-600 border-slate-500/50';
    }
  };
  
  return (
    <Card className={cn("transition-all hover:shadow-md animate-fade-in", className)} onClick={onClick}>
      <CardContent className="p-4 pb-0">
        <div className="flex flex-row justify-between items-start mb-2">
          <h3 className="font-medium text-lg truncate mr-4">{project.name}</h3>
          <Badge variant="outline" className={cn(getStatusColor(project.status), "capitalize")}>
            {project.status}
          </Badge>
        </div>
        <p className="text-muted-foreground mb-4 truncate">{project.client}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Budget</span>
            <span className="font-medium">{formatCurrency(project.budget)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Invoiced</span>
            <span className="font-medium">{formatCurrency(project.invoiced)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Remaining</span>
            <span className="font-medium">{formatCurrency(remaining)}</span>
          </div>
          <Progress value={progress} className="h-2 mt-2" />
        </div>
        
        <div className="flex justify-between text-sm text-muted-foreground mb-1">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(project.startDate)}</span>
          </div>
          <span>-</span>
          <div className="flex items-center gap-1">
            {project.status === 'completed' ? (
              <CalendarCheck className="h-4 w-4 text-green-500" />
            ) : new Date(project.endDate) < new Date() ? (
              <CalendarX className="h-4 w-4 text-red-500" />
            ) : (
              <Calendar className="h-4 w-4" />
            )}
            <span>{formatDate(project.endDate)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between">
        <span className="text-sm">{project.invoiceCount} invoice{project.invoiceCount !== 1 ? 's' : ''}</span>
        <Button variant="ghost" size="sm" className="text-sm h-8" onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
