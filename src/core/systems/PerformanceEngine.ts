import { EventEmitter } from 'events';
import { PerformanceSchedule, SimulationSettings } from '../../types';

export class PerformanceEngine extends EventEmitter {
  private schedule: PerformanceSchedule;
  private settings: SimulationSettings;

  constructor(schedule: PerformanceSchedule, settings: SimulationSettings) {
    super();
    this.schedule = schedule;
    this.settings = settings;
  }

  public process(currentTime: Date): void {
    // Update performance status
    this.updatePerformanceStatus(currentTime);
    
    // Emit performance updates
    this.emitPerformanceUpdates(currentTime);
  }

  private updatePerformanceStatus(currentTime: Date): void {
    // Simulate performance updates
    if (this.schedule.performances.length > 0) {
      this.schedule.performances.forEach(performance => {
        if (performance.status === 'Scheduled') {
          const timeUntilStart = performance.startTime.getTime() - currentTime.getTime();
          
          if (timeUntilStart <= 0 && timeUntilStart > -performance.duration) {
            performance.status = 'InProgress';
            this.emit('performanceStarted', performance);
          } else if (timeUntilStart <= -performance.duration) {
            performance.status = 'Completed';
            this.emit('performanceCompleted', performance);
          }
        }
      });
    }
  }

  private emitPerformanceUpdates(currentTime: Date): void {
    // Emit performance updates every 15 minutes
    if (currentTime.getMinutes() % 15 === 0) {
      const activePerformances = this.schedule.performances.filter(p => p.status === 'InProgress');
      
      if (activePerformances.length > 0) {
        activePerformances.forEach(performance => {
          this.emit('performanceUpdate', {
            ...performance,
            currentTime,
            satisfaction: Math.random() * 0.3 + 0.7 // 70-100% satisfaction
          });
        });
      }
    }
  }

  public getPerformanceMetrics(): any {
    const totalPerformances = this.schedule.performances.length;
    const completedPerformances = this.schedule.performances.filter(p => p.status === 'Completed').length;
    const activePerformances = this.schedule.performances.filter(p => p.status === 'InProgress').length;
    
    return {
      total: totalPerformances,
      completed: completedPerformances,
      active: activePerformances,
      scheduled: this.schedule.performances.filter(p => p.status === 'Scheduled').length,
      averageSatisfaction: 0.85,
      onTimeRate: 0.95
    };
  }

  public processDecision(decision: any): void {
    // Process performance-related decisions
    switch (decision.type) {
      case 'schedule':
        // Handle scheduling decisions
        break;
      case 'timing':
        // Handle timing decisions
        break;
      case 'artist':
        // Handle artist decisions
        break;
    }
  }
}
