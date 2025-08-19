import { EventEmitter } from 'events';
import { Budget, SimulationSettings } from '../../types';

export class FinancialEngine extends EventEmitter {
  private budget: Budget;
  private settings: SimulationSettings;
  private revenueStreams: Map<string, number> = new Map();
  private costStreams: Map<string, number> = new Map();

  constructor(budget: Budget, settings: SimulationSettings) {
    super();
    this.budget = budget;
    this.settings = settings;
    
    this.initializeStreams();
  }

  private initializeStreams(): void {
    // Initialize revenue streams
    this.revenueStreams.set('ticketSales', 0);
    this.revenueStreams.set('vendorFees', 0);
    this.revenueStreams.set('merchandise', 0);
    this.revenueStreams.set('sponsorships', 0);
    this.revenueStreams.set('foodAndBeverage', 0);
    
    // Initialize cost streams
    this.costStreams.set('artistFees', 0);
    this.costStreams.set('venueRental', 0);
    this.costStreams.set('staffing', 0);
    this.costStreams.set('equipment', 0);
    this.costStreams.set('marketing', 0);
    this.costStreams.set('insurance', 0);
    this.costStreams.set('utilities', 0);
    this.costStreams.set('security', 0);
  }

  public process(currentTime: Date): void {
    // Update revenue streams
    this.updateRevenueStreams(currentTime);
    
    // Update cost streams
    this.updateCostStreams(currentTime);
    
    // Update budget totals
    this.updateBudgetTotals();
    
    // Check for budget alerts
    this.checkBudgetAlerts();
  }

  private updateRevenueStreams(currentTime: Date): void {
    const hour = currentTime.getHours();
    const dayOfWeek = currentTime.getDay();
    
    // Ticket sales (main revenue stream)
    if (hour >= 12 && hour <= 23) {
      const baseTicketSales = 1000; // Base daily ticket sales
      const timeMultiplier = this.getTimeMultiplier(hour);
      const dayMultiplier = dayOfWeek === 5 || dayOfWeek === 6 ? 1.5 : 1.0; // Weekend boost
      
      const dailyRevenue = baseTicketSales * timeMultiplier * dayMultiplier;
      this.revenueStreams.set('ticketSales', dailyRevenue);
    }
    
    // Vendor fees
    const vendorRevenue = 5000; // Fixed daily vendor fees
    this.revenueStreams.set('vendorFees', vendorRevenue);
    
    // Food and beverage (percentage of ticket sales)
    const ticketSales = this.revenueStreams.get('ticketSales') || 0;
    const fAndBRevenue = ticketSales * 0.3;
    this.revenueStreams.set('foodAndBeverage', fAndBRevenue);
    
    // Merchandise sales
    const merchRevenue = ticketSales * 0.1;
    this.revenueStreams.set('merchandise', merchRevenue);
    
    // Sponsorships (fixed daily amount)
    const sponsorshipRevenue = 10000;
    this.revenueStreams.set('sponsorships', sponsorshipRevenue);
  }

  private updateCostStreams(currentTime: Date): void {
    // Artist fees (fixed daily cost)
    const artistCost = 50000;
    this.costStreams.set('artistFees', artistCost);
    
    // Venue rental (fixed daily cost)
    const venueCost = 15000;
    this.costStreams.set('venueRental', venueCost);
    
    // Staffing (varies by time)
    const hour = currentTime.getHours();
    const baseStaffingCost = 20000;
    const timeMultiplier = hour >= 12 && hour <= 23 ? 1.5 : 1.0;
    const staffingCost = baseStaffingCost * timeMultiplier;
    this.costStreams.set('staffing', staffingCost);
    
    // Equipment (fixed daily cost)
    const equipmentCost = 10000;
    this.costStreams.set('equipment', equipmentCost);
    
    // Marketing (fixed daily cost)
    const marketingCost = 5000;
    this.costStreams.set('marketing', marketingCost);
    
    // Insurance (fixed daily cost)
    const insuranceCost = 3000;
    this.costStreams.set('insurance', insuranceCost);
    
    // Utilities (varies by usage)
    const utilitiesCost = 8000;
    this.costStreams.set('utilities', utilitiesCost);
    
    // Security (varies by crowd size)
    const securityCost = 12000;
    this.costStreams.set('security', securityCost);
  }

  private updateBudgetTotals(): void {
    // Calculate total revenue
    this.budget.revenue = Array.from(this.revenueStreams.values()).reduce((sum, value) => sum + value, 0);
    
    // Calculate total costs
    this.budget.spent = Array.from(this.costStreams.values()).reduce((sum, value) => sum + value, 0);
    
    // Calculate profit
    this.budget.profit = this.budget.revenue - this.budget.spent;
    
    // Update budget categories
    this.updateBudgetCategories();
  }

  private updateBudgetCategories(): void {
    this.budget.categories.forEach(category => {
      switch (category.name) {
        case 'Artist Fees':
          category.spent = this.costStreams.get('artistFees') || 0;
          break;
        case 'Venue & Infrastructure':
          category.spent = (this.costStreams.get('venueRental') || 0) + 
                          (this.costStreams.get('equipment') || 0) + 
                          (this.costStreams.get('utilities') || 0);
          break;
        case 'Staff & Security':
          category.spent = (this.costStreams.get('staffing') || 0) + 
                          (this.costStreams.get('security') || 0);
          break;
        case 'Marketing & Promotion':
          category.spent = this.costStreams.get('marketing') || 0;
          break;
        case 'Contingency':
          category.spent = 0; // Contingency is not spent unless needed
          break;
      }
      
      category.remaining = category.allocated - category.spent;
    });
  }

  private checkBudgetAlerts(): void {
    // Check for budget overruns
    this.budget.categories.forEach(category => {
      if (category.critical && category.remaining < 0) {
        this.emit('budgetAlert', {
          type: 'Critical Overrun',
          category: category.name,
          allocated: category.allocated,
          spent: category.spent,
          remaining: category.remaining,
          severity: 'High'
        });
      } else if (category.remaining < category.allocated * 0.1) {
        this.emit('budgetAlert', {
          type: 'Low Budget Warning',
          category: category.name,
          allocated: category.allocated,
          spent: category.spent,
          remaining: category.remaining,
          severity: 'Medium'
        });
      }
    });
    
    // Check overall budget health
    if (this.budget.profit < -100000) {
      this.emit('budgetAlert', {
        type: 'Major Loss Warning',
        revenue: this.budget.revenue,
        costs: this.budget.spent,
        profit: this.budget.profit,
        severity: 'Critical'
      });
    }
  }

  private getTimeMultiplier(hour: number): number {
    if (hour >= 20 && hour <= 23) {
      return 1.8; // Peak hours
    } else if (hour >= 18 && hour <= 19) {
      return 1.5; // Evening rush
    } else if (hour >= 12 && hour <= 17) {
      return 1.2; // Afternoon
    } else {
      return 0.5; // Morning/early hours
    }
  }

  public addIncidentCost(cost: number): void {
    // Add incident cost to contingency budget
    const contingencyCategory = this.budget.categories.find(c => c.name === 'Contingency');
    if (contingencyCategory) {
      contingencyCategory.spent += cost;
      contingencyCategory.remaining = contingencyCategory.allocated - contingencyCategory.spent;
    }
    
    // Update total spent
    this.budget.spent += cost;
    this.budget.profit = this.budget.revenue - this.budget.spent;
  }

  public updatePerformanceRevenue(performance: any): void {
    // Update revenue based on performance success
    if (performance && performance.status === 'Completed') {
      const performanceRevenue = 5000; // Base performance revenue
      this.revenueStreams.set('ticketSales', 
        (this.revenueStreams.get('ticketSales') || 0) + performanceRevenue
      );
    }
  }

  public triggerCostCutting(alert: any): void {
    // Implement cost-cutting measures
    if (alert.severity === 'Critical') {
      // Reduce non-critical costs
      this.costStreams.set('marketing', (this.costStreams.get('marketing') || 0) * 0.5);
      this.costStreams.set('equipment', (this.costStreams.get('equipment') || 0) * 0.8);
      
      this.emit('budgetAlert', {
        type: 'Cost Cutting Implemented',
        description: 'Non-critical costs reduced due to budget constraints',
        severity: 'Medium'
      });
    }
  }

  public processDecision(decision: any): void {
    switch (decision.type) {
      case 'increaseBudget':
        this.budget.total += decision.amount || 100000;
        this.budget.allocated += decision.amount || 100000;
        break;
      case 'reduceCosts':
        const reductionAmount = decision.amount || 50000;
        this.budget.spent = Math.max(0, this.budget.spent - reductionAmount);
        this.budget.profit = this.budget.revenue - this.budget.spent;
        break;
      case 'addRevenue':
        const revenueAmount = decision.amount || 25000;
        this.revenueStreams.set('sponsorships', 
          (this.revenueStreams.get('sponsorships') || 0) + revenueAmount
        );
        break;
    }
  }

  public isBankrupt(): boolean {
    return this.budget.profit < -500000; // Bankruptcy threshold
  }

  public getFinancialMetrics(): any {
    const totalRevenue = this.budget.revenue;
    const totalCosts = this.budget.spent;
    const profit = this.budget.profit;
    
    return {
      revenue: totalRevenue,
      costs: totalCosts,
      profit: profit,
      roi: totalRevenue > 0 ? ((profit / totalRevenue) * 100) : 0,
      breakEven: profit >= 0,
      projections: this.generateProjections(),
      revenueBreakdown: Object.fromEntries(this.revenueStreams),
      costBreakdown: Object.fromEntries(this.costStreams)
    };
  }

  private generateProjections(): any[] {
    const projections = [];
    const currentDate = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const projectionDate = new Date(currentDate);
      projectionDate.setDate(projectionDate.getDate() + i);
      
      const projectedRevenue = this.budget.revenue * (1 + (i * 0.05)); // 5% daily growth
      const projectedCosts = this.budget.spent * (1 + (i * 0.02)); // 2% daily growth
      const projectedProfit = projectedRevenue - projectedCosts;
      
      projections.push({
        date: projectionDate,
        projectedRevenue,
        projectedCosts,
        projectedProfit,
        confidence: Math.max(0.1, 1 - (i * 0.1)) // Decreasing confidence over time
      });
    }
    
    return projections;
  }
}
