import { EventEmitter } from 'events';
import { Venue, SimulationSettings } from '../../types';

export class PowerEngine extends EventEmitter {
  private venue: Venue;
  private settings: SimulationSettings;

  constructor(venue: Venue, settings: SimulationSettings) {
    super();
    this.venue = venue;
    this.settings = settings;
  }

  public process(currentTime: Date): void {
    // Update power grid status
    this.updatePowerGrid(currentTime);
    
    // Check for power issues
    this.checkPowerIssues(currentTime);
  }

  private updatePowerGrid(currentTime: Date): void {
    // Simulate power grid operations
    const hour = currentTime.getHours();
    
    // Power usage varies by time
    if (hour >= 20 && hour <= 23) {
      // Peak hours - high power usage
      this.venue.stages.forEach(stage => {
        if (stage.equipment.power.status === 'Operational') {
          // Simulate high power consumption
          if (Math.random() < 0.001) { // 0.1% chance of power issue
            stage.equipment.power.status = 'Maintenance';
            this.emit('powerIssue', {
              stage: stage.name,
              type: 'High Load',
              time: currentTime
            });
          }
        }
      });
    }
  }

  private checkPowerIssues(currentTime: Date): void {
    // Check for equipment power failures
    this.venue.stages.forEach(stage => {
      if (stage.equipment.power.status === 'Maintenance') {
        // Simulate power restoration
        if (Math.random() < 0.1) { // 10% chance of restoration
          stage.equipment.power.status = 'Operational';
          this.emit('powerRestored', {
            stage: stage.name,
            time: currentTime
          });
        }
      }
    });
  }

  public getPowerMetrics(): any {
    const totalStages = this.venue.stages.length;
    const operationalStages = this.venue.stages.filter(s => s.equipment.power.status === 'Operational').length;
    
    return {
      totalStages,
      operationalStages,
      powerUptime: operationalStages / totalStages,
      averageLoad: 0.75,
      criticalAlerts: 0
    };
  }
}
