import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AnimatedNumber from './AnimatedNumber';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';
import { TrendingUp, DollarSign } from 'lucide-react';

interface BudgetProps {
  totalBudget: number;
  invoicedAmount: number;
  className?: string;
}

const Budget: React.FC<BudgetProps> = ({ 
  totalBudget, 
  invoicedAmount,
  className
}) => {
  const { formatCurrency, settings } = useSettings();
  const percentage = totalBudget > 0 ? Math.min((invoicedAmount / totalBudget) * 100, 100) : 0;
  const remaining = totalBudget - invoicedAmount;
  
  const getStatusColor = (percent: number) => {
    if (percent > 90) return {
      bg: "bg-aura-red/10",
      text: "text-aura-red", 
      progressColor: "bg-aura-red",
      border: "border-aura-red"
    };
    if (percent > 75) return {
      bg: "bg-aura-orange/10", 
      text: "text-aura-orange", 
      progressColor: "bg-aura-orange",
      border: "border-aura-orange"
    };
    return {
      bg: "bg-aura-green/10", 
      text: "text-aura-green", 
      progressColor: "bg-aura-green",
      border: "border-aura-green"
    };
  };
  
  const colors = getStatusColor(percentage);
  
  return (
    <Card className={cn("overflow-hidden transition-all border-t-4", colors.border, className)}>
      <CardHeader className="pb-2 pt-4 px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <div className={cn("p-1.5 rounded-full", colors.bg)}>
              <DollarSign className={cn("h-3.5 w-3.5", colors.text)} />
            </div>
            Budget Overview
          </CardTitle>
          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", 
            colors.bg, colors.text
          )}>
            {percentage.toFixed(0)}% Used
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-6 pt-2 px-6">
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold flex items-baseline gap-1">
                <AnimatedNumber 
                  value={invoicedAmount} 
                  prefix={settings.currencySymbol} 
                  decimals={0} 
                  className="text-foreground"
                />
                <span className="text-xs text-muted-foreground font-normal">of {formatCurrency(totalBudget)}</span>
              </span>
            </div>
            <div className={cn("text-sm font-medium flex items-center gap-1", colors.text)}>
              <TrendingUp className="h-3.5 w-3.5" />
              {formatCurrency(remaining)}
              <span className="text-xs font-normal text-muted-foreground">remaining</span>
            </div>
          </div>
          <Progress 
            value={percentage} 
            className={cn("h-2 transition-all", colors.progressColor)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default Budget;
