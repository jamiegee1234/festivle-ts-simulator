import { EventEmitter } from 'events';
import { StaffMember, SimulationSettings } from '../../types';

export class StaffEngine extends EventEmitter {
  private staff: StaffMember[];
  private settings: SimulationSettings;

  constructor(staff: StaffMember[], settings: SimulationSettings) {
    super();
    this.staff = staff;
    this.settings = settings;
  }

  public process(currentTime: Date): void {
    // Update staff availability
    this.updateStaffAvailability(currentTime);
    
    // Update staff performance
    this.updateStaffPerformance(currentTime);
  }

  private updateStaffAvailability(currentTime: Date): void {
    const hour = currentTime.getHours();
    
    this.staff.forEach(member => {
      // Check if staff member is within their availability window
      const startHour = member.availability.startTime.getHours();
      const endHour = member.availability.endTime.getHours();
      
      if (hour >= startHour && hour <= endHour) {
        // Staff member is available
        if (Math.random() < 0.01) { // 1% chance of becoming unavailable
          member.availability.overtime = true;
        }
      } else {
        // Staff member is outside availability window
        if (Math.random() < 0.05) { // 5% chance of emergency availability
          member.availability.emergency = true;
        }
      }
    });
  }

  private updateStaffPerformance(currentTime: Date): void {
    this.staff.forEach(member => {
      // Update performance based on availability and overtime
      if (member.availability.overtime) {
        member.performance.score = Math.max(0.5, member.performance.score - 0.01);
      } else if (member.availability.emergency) {
        member.performance.score = Math.min(1.0, member.performance.score + 0.02);
      }
      
      // Random performance fluctuations
      if (Math.random() < 0.1) { // 10% chance per tick
        const change = (Math.random() - 0.5) * 0.02; // ±1% change
        member.performance.score = Math.max(0.1, Math.min(1.0, member.performance.score + change));
      }
    });
  }

  public getStaffMetrics(): any {
    const totalStaff = this.staff.length;
    const availableStaff = this.staff.filter(s => 
      s.availability.startTime.getHours() <= new Date().getHours() && 
      s.availability.endTime.getHours() >= new Date().getHours()
    ).length;
    
    const averagePerformance = this.staff.reduce((sum, s) => sum + s.performance.score, 0) / totalStaff;
    
    return {
      totalStaff,
      availableStaff,
      averagePerformance,
      utilization: availableStaff / totalStaff,
      overtimeCount: this.staff.filter(s => s.availability.overtime).length,
      emergencyCount: this.staff.filter(s => s.availability.emergency).length
    };
  }

  public processDecision(decision: any): void {
    // Process staff-related decisions
    switch (decision.type) {
      case 'hire':
        // Handle hiring decisions
        break;
      case 'schedule':
        // Handle scheduling decisions
        break;
      case 'training':
        // Handle training decisions
        break;
    }
  }
}
