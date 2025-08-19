import { EventEmitter } from 'events';
import { Festival, Venue, Stage, Facility, Location } from '../../types';

export class VenueEngine extends EventEmitter {
  private festival: Festival;
  private venue: Venue;
  private noiseSensors: Map<string, number> = new Map();
  private capacityAlerts: Set<string> = new Set();
  private fireCodeViolations: any[] = [];
  private noiseComplaints: any[] = [];
  private lastCapacityCheck: Date = new Date();

  constructor(festival: Festival) {
    super();
    this.festival = festival;
    this.venue = festival.venue;
    this.initializeNoiseMonitoring();
  }

  private initializeNoiseMonitoring(): void {
    // Set up noise monitoring points around the venue
    const monitoringPoints = [
      { id: 'main-stage', location: { x: 200, y: 200 }, zone: 'Main Stage' },
      { id: 'food-court', location: { x: 600, y: 300 }, zone: 'Food Court' },
      { id: 'vip-area', location: { x: 100, y: 100 }, zone: 'VIP Area' },
      { id: 'perimeter-north', location: { x: 500, y: 50 }, zone: 'Perimeter' },
      { id: 'perimeter-south', location: { x: 500, y: 950 }, zone: 'Perimeter' },
      { id: 'perimeter-east', location: { x: 950, y: 500 }, zone: 'Perimeter' },
      { id: 'perimeter-west', location: { x: 50, y: 500 }, zone: 'Perimeter' }
    ];

    monitoringPoints.forEach(point => {
      this.noiseSensors.set(point.id, 0);
    });
  }

  public process(currentTime: Date): void {
    // Check venue capacity and fire code compliance
    this.checkVenueCapacity(currentTime);
    
    // Monitor noise levels
    this.updateNoiseMonitoring(currentTime);
    
    // Check for noise curfew violations
    this.checkNoiseCurfew(currentTime);
    
    // Update facility usage
    this.updateFacilityUsage(currentTime);
    
    // Emit venue status updates
    this.emitVenueStatus();
  }

  private checkVenueCapacity(currentTime: Date): void {
    const currentOccupancy = this.festival.currentAttendees;
    const maxCapacity = this.venue.capacity.maxAttendees;
    const fireCodeLimit = this.venue.capacity.fireCodeLimit;
    
    // Check if we're approaching capacity
    if (currentOccupancy > maxCapacity * 0.9) {
      this.emit('capacityWarning', {
        current: currentOccupancy,
        max: maxCapacity,
        percentage: (currentOccupancy / maxCapacity) * 100
      });
    }
    
    // Check fire code violations
    if (currentOccupancy > fireCodeLimit) {
      const violation = {
        id: `fire-${Date.now()}`,
        type: 'Fire Code Violation',
        severity: 'Critical',
        description: `Venue occupancy (${currentOccupancy}) exceeds fire code limit (${fireCodeLimit})`,
        timestamp: currentTime,
        location: { x: 0, y: 0, zone: 'Venue Wide' },
        resolved: false,
        response: {
          responseTime: 0,
          staffInvolved: [],
          actions: ['Immediate evacuation required', 'Contact fire department', 'Stop entry'],
          followUp: ['Review capacity management', 'Update safety protocols']
        },
        cost: 5000 // Fine for fire code violation
      };
      
      this.fireCodeViolations.push(violation);
      this.emit('fireCodeViolation', violation);
      
      // Emit incident for the main simulation
      this.emit('incident', violation);
    }
  }

  private updateNoiseMonitoring(currentTime: Date): void {
    const hour = currentTime.getHours();
    const isPeakHours = hour >= 20 && hour <= 23;
    const isQuietHours = hour >= 23 || hour <= 7;
    
    // Update noise levels based on time and crowd
    this.noiseSensors.forEach((level, sensorId) => {
      let baseNoise = 0;
      
      if (isPeakHours) {
        baseNoise = 85 + Math.random() * 20; // 85-105 dB during peak
      } else if (isQuietHours) {
        baseNoise = 40 + Math.random() * 20; // 40-60 dB during quiet hours
      } else {
        baseNoise = 60 + Math.random() * 25; // 60-85 dB during normal hours
      }
      
      // Add crowd density factor
      const crowdFactor = this.festival.currentAttendees / this.venue.capacity.maxAttendees;
      baseNoise += crowdFactor * 15;
      
      // Add some randomness
      baseNoise += (Math.random() - 0.5) * 10;
      
      this.noiseSensors.set(sensorId, Math.max(0, baseNoise));
    });
  }

  private checkNoiseCurfew(currentTime: Date): void {
    const hour = currentTime.getHours();
    const isAfterCurfew = hour >= 23 || hour <= 7;
    
    if (isAfterCurfew) {
      // Check if any noise sensors exceed quiet hour limits
      this.noiseSensors.forEach((level, sensorId) => {
        if (level > 65) { // 65 dB limit during quiet hours
          const complaint = {
            id: `noise-${Date.now()}`,
            type: 'Noise Curfew Violation',
            severity: 'Moderate',
            description: `Noise level at ${sensorId}: ${level.toFixed(1)} dB (exceeds 65 dB curfew limit)`,
            timestamp: currentTime,
            location: this.getSensorLocation(sensorId),
            resolved: false,
            response: {
              responseTime: 0,
              staffInvolved: [],
              actions: ['Reduce volume', 'Move activities indoors', 'Contact local council'],
              followUp: ['Review noise management', 'Update curfew protocols']
            },
            cost: 1000 // Fine for noise violation
          };
          
          this.noiseComplaints.push(complaint);
          this.emit('noiseViolation', complaint);
        }
      });
    }
  }

  private getSensorLocation(sensorId: string): Location {
    // Map sensor IDs to approximate locations
    const sensorLocations: Record<string, Location> = {
      'main-stage': { x: 200, y: 200, zone: 'Main Stage' },
      'food-court': { x: 600, y: 300, zone: 'Food Court' },
      'vip-area': { x: 100, y: 100, zone: 'VIP Area' },
      'perimeter-north': { x: 500, y: 50, zone: 'Perimeter' },
      'perimeter-south': { x: 500, y: 950, zone: 'Perimeter' },
      'perimeter-east': { x: 950, y: 500, zone: 'Perimeter' },
      'perimeter-west': { x: 50, y: 500, zone: 'Perimeter' }
    };
    
    return sensorLocations[sensorId] || { x: 0, y: 0, zone: 'Unknown' };
  }

  private updateFacilityUsage(currentTime: Date): void {
    // Update facility usage based on crowd
    this.venue.facilities.forEach(facility => {
      const baseUsage = this.festival.currentAttendees / this.venue.capacity.maxAttendees;
      let usageMultiplier = 1;
      
      // Different facilities have different usage patterns
      switch (facility.type) {
        case 'Toilet':
          usageMultiplier = 0.8 + (baseUsage * 0.4); // More usage during peak
          break;
        case 'Bar':
          usageMultiplier = baseUsage * 1.2; // Bar usage follows crowd
          break;
        case 'Food':
          usageMultiplier = 0.6 + (baseUsage * 0.8); // Food has steady usage
          break;
        case 'Medical':
          usageMultiplier = 0.1 + (baseUsage * 0.2); // Medical has low base usage
          break;
        case 'Security':
          usageMultiplier = 0.3 + (baseUsage * 0.7); // Security scales with crowd
          break;
        default:
          usageMultiplier = baseUsage;
      }
      
      facility.currentUsage = Math.min(facility.capacity, 
        Math.floor(facility.capacity * usageMultiplier));
    });
  }

  private emitVenueStatus(): void {
    const status = {
      capacity: {
        current: this.festival.currentAttendees,
        max: this.venue.capacity.maxAttendees,
        fireCodeLimit: this.venue.capacity.fireCodeLimit,
        utilization: (this.festival.currentAttendees / this.venue.capacity.maxAttendees) * 100
      },
      noise: {
        sensors: Object.fromEntries(this.noiseSensors),
        average: Array.from(this.noiseSensors.values()).reduce((a, b) => a + b, 0) / this.noiseSensors.size
      },
      facilities: this.venue.facilities.map(f => ({
        type: f.type,
        usage: f.currentUsage,
        capacity: f.capacity,
        utilization: (f.currentUsage / f.capacity) * 100
      })),
      violations: {
        fireCode: this.fireCodeViolations.length,
        noise: this.noiseComplaints.length
      }
    };
    
    this.emit('venueStatus', status);
  }

  // Public API methods
  public getVenueMetrics(): any {
    return {
      capacity: {
        current: this.festival.currentAttendees,
        max: this.venue.capacity.maxAttendees,
        fireCodeLimit: this.venue.capacity.fireCodeLimit,
        utilization: (this.festival.currentAttendees / this.venue.capacity.maxAttendees) * 100
      },
      noise: {
        sensors: Object.fromEntries(this.noiseSensors),
        average: Array.from(this.noiseSensors.values()).reduce((a, b) => a + b, 0) / this.noiseSensors.size
      },
      facilities: this.venue.facilities.map(f => ({
        type: f.type,
        usage: f.currentUsage,
        capacity: f.capacity,
        utilization: (f.currentUsage / f.capacity) * 100
      })),
      violations: {
        fireCode: this.fireCodeViolations,
        noise: this.noiseComplaints
      }
    };
  }

  public getNoiseLevels(): Map<string, number> {
    return new Map(this.noiseSensors);
  }

  public getCapacityStatus(): any {
    return {
      current: this.festival.currentAttendees,
      max: this.venue.capacity.maxAttendees,
      fireCodeLimit: this.venue.capacity.fireCodeLimit,
      utilization: (this.festival.currentAttendees / this.venue.capacity.maxAttendees) * 100,
      warnings: Array.from(this.capacityAlerts)
    };
  }

  public processDecision(decision: any): void {
    // Handle venue-related decisions
    switch (decision.type) {
      case 'reduceCapacity':
        // Implement capacity reduction measures
        break;
      case 'adjustNoise':
        // Implement noise reduction measures
        break;
      case 'evacuate':
        // Implement evacuation procedures
        break;
    }
  }
}
