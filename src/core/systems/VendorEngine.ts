import { EventEmitter } from 'events';
import { Vendor, SimulationSettings } from '../../types';

export class VendorEngine extends EventEmitter {
  private vendors: Vendor[];
  private settings: SimulationSettings;

  constructor(vendors: Vendor[], settings: SimulationSettings) {
    super();
    this.vendors = vendors;
    this.settings = settings;
  }

  public process(currentTime: Date): void {
    // Update vendor operations
    this.updateVendorOperations(currentTime);
    
    // Update queues and revenue
    this.updateVendorMetrics(currentTime);
  }

  private updateVendorOperations(currentTime: Date): void {
    const hour = currentTime.getHours();
    
    this.vendors.forEach(vendor => {
      // Update queue length based on time
      if (hour >= 12 && hour <= 23) {
        const baseQueue = Math.floor(Math.random() * 50) + 10;
        vendor.currentQueue = Math.min(vendor.capacity, baseQueue);
        
        // Generate revenue based on queue length
        const revenuePerCustomer = vendor.type === 'Food' ? 15 : vendor.type === 'Beverage' ? 8 : 25;
        vendor.revenue += vendor.currentQueue * revenuePerCustomer * 0.1; // 10% conversion rate
      } else {
        vendor.currentQueue = Math.max(0, vendor.currentQueue - Math.floor(Math.random() * 5));
      }
      
      // Update satisfaction based on queue length
      if (vendor.currentQueue > vendor.capacity * 0.8) {
        vendor.satisfaction = Math.max(0.3, vendor.satisfaction - 0.05);
      } else if (vendor.currentQueue < vendor.capacity * 0.2) {
        vendor.satisfaction = Math.min(1.0, vendor.satisfaction + 0.02);
      }
    });
  }

  private updateVendorMetrics(currentTime: Date): void {
    // Emit vendor updates
    this.vendors.forEach(vendor => {
      if (Math.random() < 0.1) { // 10% chance per tick
        this.emit('vendorUpdate', {
          vendor,
          time: currentTime,
          metrics: {
            queueLength: vendor.currentQueue,
            revenue: vendor.revenue,
            satisfaction: vendor.satisfaction,
            utilization: vendor.currentQueue / vendor.capacity
          }
        });
      }
    });
  }

  public getVendorMetrics(): any {
    const totalVendors = this.vendors.length;
    const totalRevenue = this.vendors.reduce((sum, v) => sum + v.revenue, 0);
    const averageSatisfaction = this.vendors.reduce((sum, v) => sum + v.satisfaction, 0) / totalVendors;
    
    return {
      totalVendors,
      totalRevenue,
      averageSatisfaction,
      averageQueueLength: this.vendors.reduce((sum, v) => sum + v.currentQueue, 0) / totalVendors,
      revenueByType: this.getRevenueByType()
    };
  }

  private getRevenueByType(): Record<string, number> {
    const revenueByType: Record<string, number> = {};
    
    this.vendors.forEach(vendor => {
      if (!revenueByType[vendor.type]) {
        revenueByType[vendor.type] = 0;
      }
      revenueByType[vendor.type] = (revenueByType[vendor.type] || 0) + vendor.revenue;
    });
    
    return revenueByType;
  }
}
