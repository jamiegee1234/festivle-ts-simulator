import { EventEmitter } from 'events';
import { Festival, SimulationSettings } from '../../types';

export class LogisticsEngine extends EventEmitter {
  private festival: Festival;
  private settings: SimulationSettings;

  constructor(festival: Festival, settings: SimulationSettings) {
    super();
    this.festival = festival;
    this.settings = settings;
  }

  public process(currentTime: Date): void {
    // Update venue operations
    this.updateVenueOperations(currentTime);
    
    // Update equipment status
    this.updateEquipmentStatus(currentTime);
    
    // Update facility usage
    this.updateFacilityUsage(currentTime);
  }

  private updateVenueOperations(currentTime: Date): void {
    // Simulate venue operations
    const hour = currentTime.getHours();
    
    // Update venue capacity based on time
    if (hour >= 12 && hour <= 23) {
      // Peak hours - increase capacity usage
      this.festival.venue.capacity.currentOccupancy = Math.min(
        this.festival.venue.capacity.maxAttendees,
        this.festival.currentAttendees + Math.floor(Math.random() * 1000)
      );
    } else {
      // Off-peak hours - decrease capacity usage
      this.festival.venue.capacity.currentOccupancy = Math.max(
        0,
        this.festival.venue.capacity.currentOccupancy - Math.floor(Math.random() * 500)
      );
    }
  }

  private updateEquipmentStatus(currentTime: Date): void {
    // Simulate equipment status changes
    this.festival.venue.stages.forEach(stage => {
      // Random equipment failures (very low probability)
      if (Math.random() < 0.001) {
        const equipmentTypes = ['audio', 'lighting', 'video', 'power', 'special'];
        const randomType = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
        
        if (stage.equipment && stage.equipment[randomType as keyof typeof stage.equipment]) {
          (stage.equipment[randomType as keyof typeof stage.equipment] as any).status = 'Maintenance';
          this.emit('equipmentFailure', {
            stage: stage.name,
            equipmentType: randomType,
            time: currentTime
          });
        }
      }
    });
  }

  private updateFacilityUsage(currentTime: Date): void {
    // Update facility usage based on crowd
    this.festival.venue.facilities.forEach(facility => {
      const baseUsage = this.festival.currentAttendees / this.festival.capacity;
      const timeMultiplier = this.getTimeMultiplier(currentTime);
      
      facility.currentUsage = Math.min(
        facility.capacity,
        Math.floor(baseUsage * facility.capacity * timeMultiplier)
      );
    });
  }

  private getTimeMultiplier(currentTime: Date): number {
    const hour = currentTime.getHours();
    
    if (hour >= 20 && hour <= 23) {
      return 1.5; // Peak usage
    } else if (hour >= 12 && hour <= 19) {
      return 1.2; // High usage
    } else if (hour >= 6 && hour <= 11) {
      return 0.8; // Moderate usage
    } else {
      return 0.3; // Low usage
    }
  }

  public updateWeatherImpact(weather: any): void {
    // Adjust logistics based on weather
    if (weather.current.precipitation > 10) {
      // Rain affects outdoor operations
      this.festival.venue.facilities.forEach(facility => {
        if (facility.type === 'Toilet') {
          facility.currentUsage = Math.min(facility.capacity, facility.currentUsage + 20);
        }
      });
    }
    
    if (weather.current.temperature > 30) {
      // Heat affects equipment and facilities
      this.festival.venue.stages.forEach(stage => {
        if (stage.equipment.power.status === 'Operational') {
          // Increase power consumption for cooling
          stage.equipment.power.status = 'Maintenance';
        }
      });
    }
  }

  public getOperationalMetrics(): any {
    const totalFacilities = this.festival.venue.facilities.length;
    const operationalFacilities = this.festival.venue.facilities.filter(
      f => f.maintenance.status === 'Operational'
    ).length;
    
    const totalStages = this.festival.venue.stages.length;
    const operationalStages = this.festival.venue.stages.filter(
      s => s.equipment.audio.status === 'Operational' && 
           s.equipment.lighting.status === 'Operational'
    ).length;
    
    return {
      efficiency: operationalFacilities / totalFacilities,
      responseTime: 300, // 5 minutes average
      incidents: 0,
      staffUtilization: 0.8,
      equipmentUptime: operationalStages / totalStages,
      facilityUtilization: this.festival.venue.facilities.filter(
        f => f.currentUsage && f.capacity
      ).reduce(
        (sum, f) => sum + (f.currentUsage / f.capacity), 0
      ) / totalFacilities
    };
  }

  public processDecision(decision: any): void {
    // Process logistics-related decisions
    switch (decision.type) {
      case 'route':
        // Handle routing decisions
        break;
      case 'equipment':
        // Handle equipment decisions
        break;
      case 'facility':
        // Handle facility decisions
        break;
    }
  }
}
