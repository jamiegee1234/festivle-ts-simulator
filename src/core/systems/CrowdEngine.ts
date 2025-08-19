import { EventEmitter } from 'events';
import { Festival, Attendee, CrowdBehavior, Location, WeatherSystem, SimulationSettings } from '../../types';
import Chance from 'chance';
import { createNoise2D } from 'simplex-noise';

export class CrowdEngine extends EventEmitter {
  private festival: Festival;
  private settings: SimulationSettings;
  private attendees: Attendee[] = [];
  private chance: Chance;
  private noise2D: ReturnType<typeof createNoise2D>;
  private baseTime: number;
  private crowdFlow: Map<string, number> = new Map();
  private satisfactionFactors: Map<string, number> = new Map();

  constructor(festival: Festival, settings: SimulationSettings) {
    super();
    this.festival = festival;
    this.settings = settings;
    this.chance = new Chance();
    this.noise2D = createNoise2D();
    this.baseTime = Date.now();
    
    this.initializeAttendees();
  }

  private initializeAttendees(): void {
    // Generate realistic attendee distribution based on festival capacity
    const totalCapacity = this.festival.capacity;
    
    // Attendee type distribution
    const gaPercentage = 0.7;
    const vipPercentage = 0.15;
    const pressPercentage = 0.05;
    const influencerPercentage = 0.1;

    // Generate GA attendees
    const gaCount = Math.floor(totalCapacity * gaPercentage);
    for (let i = 0; i < gaCount; i++) {
      this.attendees.push(this.generateAttendee('GA'));
    }

    // Generate VIP attendees
    const vipCount = Math.floor(totalCapacity * vipPercentage);
    for (let i = 0; i < vipCount; i++) {
      this.attendees.push(this.generateAttendee('VIP'));
    }

    // Generate Press attendees
    const pressCount = Math.floor(totalCapacity * pressPercentage);
    for (let i = 0; i < pressCount; i++) {
      this.attendees.push(this.generateAttendee('Press'));
    }

    // Generate Influencer attendees
    const influencerCount = Math.floor(totalCapacity * influencerPercentage);
    for (let i = 0; i < influencerCount; i++) {
      this.attendees.push(this.generateAttendee('Influencer'));
    }

    // Distribute attendees across venue zones
    this.distributeAttendees();
  }

  private generateAttendee(type: string): Attendee {
    const demographics = this.generateDemographics();
    const preferences = this.generatePreferences(demographics);
    
    return {
      id: this.chance.guid(),
      type: type as any,
      demographics,
      preferences,
      behavior: {
        density: 0,
        movement: {
          speed: this.chance.floating({ min: 0.5, max: 2.0 }),
          direction: this.chance.floating({ min: 0, max: 360 }),
          destination: this.generateRandomLocation(),
          obstacles: [],
          congestion: 0
        },
        mood: this.chance.floating({ min: 0.3, max: 0.8 }),
        energy: this.chance.floating({ min: 0.4, max: 0.9 }),
        riskLevel: 'Low',
        socialInteractions: []
      },
      satisfaction: this.chance.floating({ min: 0.5, max: 0.9 }),
      spending: {
        food: 0,
        beverages: 0,
        merchandise: 0,
        activities: 0,
        total: 0
      },
      location: this.generateRandomLocation(),
      status: 'Active'
    };
  }

  private generateDemographics(): any {
    const ageGroups = [18, 25, 35, 45, 55];
    const ageWeights = [0.3, 0.4, 0.2, 0.08, 0.02];
    
    return {
      age: this.chance.weighted(ageGroups, ageWeights),
      gender: this.chance.pickone(['Male', 'Female', 'Non-binary']),
      location: this.chance.city(),
      income: this.chance.pickone(['Low', 'Medium', 'High']),
      interests: this.chance.pickset([
        'Music', 'Art', 'Food', 'Technology', 'Fashion', 'Sports', 'Gaming', 'Travel'
      ], this.chance.integer({ min: 2, max: 5 }))
    };
  }

  private generatePreferences(demographics: any): any {
    const musicGenres = ['Rock', 'Pop', 'Electronic', 'Hip-Hop', 'Jazz', 'Country', 'Folk'];
    const activities = ['Dancing', 'Socializing', 'Eating', 'Shopping', 'Exploring', 'Relaxing'];
    
    return {
      music: this.chance.pickset(musicGenres, this.chance.integer({ min: 2, max: 4 })),
      activities: this.chance.pickset(activities, this.chance.integer({ min: 2, max: 4 })),
      food: this.chance.pickset(['Fast Food', 'Gourmet', 'Vegetarian', 'Street Food', 'Fine Dining'], 2),
      beverages: this.chance.pickset(['Beer', 'Wine', 'Cocktails', 'Soft Drinks', 'Water'], 2),
      spending: this.chance.floating({ min: 50, max: 500 })
    };
  }

  private generateRandomLocation(): Location {
    return {
      x: this.chance.floating({ min: 0, max: 1000 }),
      y: this.chance.floating({ min: 0, max: 1000 }),
      zone: this.chance.pickone(['Main Stage', 'Food Court', 'VIP Area', 'Vendor Row', 'Rest Area'])
    };
  }

  private distributeAttendees(): void {
    // Distribute attendees across different zones based on their type and preferences
    this.attendees.forEach(attendee => {
      if (attendee.type === 'VIP') {
        attendee.location.zone = 'VIP Area';
      } else if (attendee.type === 'Press') {
        attendee.location.zone = 'Main Stage';
      } else if (attendee.type === 'Influencer') {
        attendee.location.zone = this.chance.pickone(['VIP Area', 'Main Stage', 'Vendor Row']);
      }
      
      // Set initial location coordinates within the zone
      this.setZoneCoordinates(attendee.location);
    });
  }

  private setZoneCoordinates(location: Location): void {
    switch (location.zone) {
      case 'Main Stage':
        location.x = this.chance.floating({ min: 100, max: 400 });
        location.y = this.chance.floating({ min: 100, max: 300 });
        break;
      case 'Food Court':
        location.x = this.chance.floating({ min: 500, max: 700 });
        location.y = this.chance.floating({ min: 200, max: 400 });
        break;
      case 'VIP Area':
        location.x = this.chance.floating({ min: 50, max: 150 });
        location.y = this.chance.floating({ min: 50, max: 150 });
        break;
      case 'Vendor Row':
        location.x = this.chance.floating({ min: 600, max: 900 });
        location.y = this.chance.floating({ min: 100, max: 200 });
        break;
      case 'Rest Area':
        location.x = this.chance.floating({ min: 200, max: 400 });
        location.y = this.chance.floating({ min: 500, max: 700 });
        break;
    }
  }

  public process(currentTime: Date): void {
    // Update crowd behavior
    this.updateCrowdBehavior(currentTime);
    
    // Update attendee movements
    this.updateAttendeeMovements(currentTime);
    
    // Update crowd density
    this.updateCrowdDensity();
    
    // Update satisfaction levels
    this.updateSatisfaction(currentTime);
    
    // Update spending patterns
    this.updateSpendingPatterns(currentTime);
    
    // Emit crowd density change event
    this.emitCrowdDensityChange();
  }

  private updateCrowdBehavior(currentTime: Date): void {
    const timeOffset = (currentTime.getTime() - this.baseTime) / (1000 * 60 * 60);
    
    this.attendees.forEach(attendee => {
      // Update energy levels based on time
      const hour = currentTime.getHours();
      if (hour >= 22 || hour <= 6) {
        attendee.behavior.energy *= 0.95; // Energy decreases at night
      } else if (hour >= 18 && hour <= 22) {
        attendee.behavior.energy *= 1.05; // Energy increases during peak hours
      }

      // Update mood based on various factors
      this.updateAttendeeMood(attendee, currentTime);
      
      // Update risk level based on behavior
      this.updateRiskLevel(attendee);
    });
  }

  private updateAttendeeMood(attendee: Attendee, currentTime: Date): void {
    let moodChange = 0;
    
    // Time-based mood changes
    const hour = currentTime.getHours();
    if (hour >= 20 && hour <= 23) {
      moodChange += 0.1; // Peak party hours
    } else if (hour >= 2 && hour <= 6) {
      moodChange -= 0.1; // Late night fatigue
    }
    
    // Weather impact (if available)
    if (this.festival.weather) {
      const weather = this.festival.weather.current;
      if (weather.temperature > 30 || weather.temperature < 5) {
        moodChange -= 0.15;
      }
      if (weather.precipitation > 10) {
        moodChange -= 0.2;
      }
    }
    
    // Crowd density impact
    const zoneDensity = this.getZoneDensity(attendee.location.zone);
    if (zoneDensity > 0.8) {
      moodChange -= 0.1; // Too crowded
    } else if (zoneDensity < 0.2) {
      moodChange -= 0.05; // Too empty
    }
    
    // Apply mood change
    attendee.behavior.mood = Math.max(0, Math.min(1, attendee.behavior.mood + moodChange));
  }

  private updateRiskLevel(attendee: Attendee): void {
    let riskScore = 0;
    
    // Behavior-based risk
    if (attendee.behavior.energy > 0.8) {
      riskScore += 0.2;
    }
    if (attendee.behavior.mood < 0.3) {
      riskScore += 0.3;
    }
    
    // Location-based risk
    const zoneDensity = this.getZoneDensity(attendee.location.zone);
    if (zoneDensity > 0.9) {
      riskScore += 0.4;
    }
    
    // Set risk level
    if (riskScore > 0.7) {
      attendee.behavior.riskLevel = 'Critical';
    } else if (riskScore > 0.5) {
      attendee.behavior.riskLevel = 'High';
    } else if (riskScore > 0.3) {
      attendee.behavior.riskLevel = 'Medium';
    } else {
      attendee.behavior.riskLevel = 'Low';
    }
  }

  private updateAttendeeMovements(currentTime: Date): void {
    this.attendees.forEach(attendee => {
      // Determine if attendee should move
      if (this.shouldMove(attendee, currentTime)) {
        this.moveAttendee(attendee, currentTime);
      }
      
      // Update movement speed based on crowd density
      const zoneDensity = this.getZoneDensity(attendee.location.zone);
      attendee.behavior.movement.speed = Math.max(0.1, attendee.behavior.movement.speed * (1 - zoneDensity * 0.5));
    });
  }

  private shouldMove(attendee: Attendee, currentTime: Date): boolean {
    // VIP attendees move less frequently
    if (attendee.type === 'VIP') {
      return this.chance.bool({ likelihood: 0.1 });
    }
    
    // Regular attendees move more frequently
    return this.chance.bool({ likelihood: 0.3 });
  }

  private moveAttendee(attendee: Attendee, currentTime: Date): void {
    // Determine new destination based on preferences and current situation
    const newZone = this.determineDestinationZone(attendee);
    const newLocation = this.generateLocationInZone(newZone);
    
    // Update movement data
    attendee.behavior.movement.destination = newLocation;
    attendee.behavior.movement.direction = this.calculateDirection(
      attendee.location,
      newLocation
    );
    
    // Move attendee towards destination
    this.moveTowardsDestination(attendee);
  }

  private determineDestinationZone(attendee: Attendee): string {
    const zonePreferences: Record<string, number> = {
      'Main Stage': 0.4,
      'Food Court': 0.2,
      'Vendor Row': 0.15,
      'Rest Area': 0.15,
      'VIP Area': attendee.type === 'VIP' ? 0.3 : 0.05
    };
    
            // Adjust preferences based on current satisfaction
        if (attendee.satisfaction < 0.4) {
          zonePreferences['Food Court'] = (zonePreferences['Food Court'] || 0) + 0.1;
          zonePreferences['Rest Area'] = (zonePreferences['Rest Area'] || 0) + 0.1;
        }
    
    // Random selection with weights
    const zones = Object.keys(zonePreferences);
    const weights = Object.values(zonePreferences);
    return this.chance.weighted(zones, weights);
  }

  private generateLocationInZone(zone: string): Location {
    return {
      x: 0,
      y: 0,
      zone
    };
  }

  private calculateDirection(from: Location, to: Location): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }

  private moveTowardsDestination(attendee: Attendee): void {
    const destination = attendee.behavior.movement.destination;
    const current = attendee.location;
    
    // Simple movement towards destination
    const dx = destination.x - current.x;
    const dy = destination.y - current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 10) {
      const moveDistance = Math.min(attendee.behavior.movement.speed * 10, distance);
      const moveX = (dx / distance) * moveDistance;
      const moveY = (dy / distance) * moveDistance;
      
      current.x += moveX;
      current.y += moveY;
    } else {
      // Reached destination, update zone
      current.zone = destination.zone;
      attendee.behavior.movement.destination = this.generateRandomLocation();
    }
  }

  private updateCrowdDensity(): void {
    // Calculate density for each zone
    const zoneCounts: Record<string, number> = {};
    
    this.attendees.forEach(attendee => {
      const zone = attendee.location.zone;
      zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
    });
    
    // Update crowd flow map
    Object.entries(zoneCounts).forEach(([zone, count]) => {
      const density = count / this.getZoneCapacity(zone);
      this.crowdFlow.set(zone, density);
    });
  }

  private getZoneCapacity(zone: string): number {
    const zoneCapacities: Record<string, number> = {
      'Main Stage': 5000,
      'Food Court': 2000,
      'VIP Area': 500,
      'Vendor Row': 1500,
      'Rest Area': 1000
    };
    
    return zoneCapacities[zone] || 1000;
  }

  private getZoneDensity(zone: string): number {
    return this.crowdFlow.get(zone) || 0;
  }

  private updateSatisfaction(currentTime: Date): void {
    this.attendees.forEach(attendee => {
      let satisfactionChange = 0;
      
      // Zone-based satisfaction
      const zoneDensity = this.getZoneDensity(attendee.location.zone);
      if (zoneDensity > 0.9) {
        satisfactionChange -= 0.05; // Too crowded
      } else if (zoneDensity < 0.1) {
        satisfactionChange -= 0.02; // Too empty
      } else if (zoneDensity > 0.3 && zoneDensity < 0.7) {
        satisfactionChange += 0.02; // Optimal density
      }
      
      // Time-based satisfaction
      const hour = currentTime.getHours();
      if (hour >= 20 && hour <= 23) {
        satisfactionChange += 0.03; // Peak hours
      }
      
      // Apply satisfaction change
      attendee.satisfaction = Math.max(0, Math.min(1, attendee.satisfaction + satisfactionChange));
    });
  }

  private updateSpendingPatterns(currentTime: Date): void {
    this.attendees.forEach(attendee => {
      // Simulate spending based on satisfaction and preferences
      if (attendee.satisfaction > 0.7 && this.chance.bool({ likelihood: 0.1 })) {
        const spendingAmount = this.chance.floating({ min: 5, max: 25 });
        
        if (attendee.location.zone === 'Food Court') {
          attendee.spending.food += spendingAmount;
        } else if (attendee.location.zone === 'Vendor Row') {
          attendee.spending.merchandise += spendingAmount;
        }
        
        attendee.spending.total += spendingAmount;
      }
    });
  }

  private emitCrowdDensityChange(): void {
    const totalAttendees = this.attendees.length;
    const averageSatisfaction = this.attendees.reduce((sum, a) => sum + a.satisfaction, 0) / totalAttendees;
    
    this.emit('crowdDensityChange', {
      totalAttendees,
      zoneDensities: Object.fromEntries(this.crowdFlow),
      averageSatisfaction,
      riskLevels: this.getRiskLevelDistribution()
    });
  }

  private getRiskLevelDistribution(): Record<string, number> {
    const distribution: Record<string, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    
    this.attendees.forEach(attendee => {
      const riskLevel = attendee.behavior.riskLevel as string;
      distribution[riskLevel] = (distribution[riskLevel] || 0) + 1;
    });
    
    return distribution;
  }

  public updateWeatherImpact(weather: WeatherSystem): void {
    this.attendees.forEach(attendee => {
      const condition = weather.current;
      
      // Temperature impact
      if (condition.temperature > 30) {
        attendee.behavior.energy *= 0.9;
        attendee.satisfaction *= 0.95;
      } else if (condition.temperature < 5) {
        attendee.behavior.energy *= 0.9;
        attendee.satisfaction *= 0.95;
      }
      
      // Precipitation impact
      if (condition.precipitation > 10) {
        attendee.behavior.energy *= 0.85;
        attendee.satisfaction *= 0.9;
      }
      
      // Wind impact
      if (condition.windSpeed > 25) {
        attendee.satisfaction *= 0.95;
      }
    });
  }

  public updatePerformanceSatisfaction(performance: any): void {
    // Update satisfaction for attendees at the performance location
    this.attendees.forEach(attendee => {
      if (attendee.location.zone === 'Main Stage') {
        // Increase satisfaction during performances
        attendee.satisfaction = Math.min(1, attendee.satisfaction + 0.1);
        attendee.behavior.energy = Math.min(1, attendee.behavior.energy + 0.15);
      }
    });
  }

  // Public API methods
  public getAttendanceMetrics(): any {
    const totalAttendees = this.attendees.length;
    const activeAttendees = this.attendees.filter(a => a.status === 'Active').length;
    
    return {
      total: totalAttendees,
      active: activeAttendees,
      byZone: Object.fromEntries(this.crowdFlow),
      averageSatisfaction: this.attendees.reduce((sum, a) => sum + a.satisfaction, 0) / totalAttendees,
      averageEnergy: this.attendees.reduce((sum, a) => sum + a.behavior.energy, 0) / totalAttendees,
      riskDistribution: this.getRiskLevelDistribution()
    };
  }

  public getAttendeesInZone(zone: string): Attendee[] {
    return this.attendees.filter(a => a.location.zone === zone);
  }

  public getAttendeeById(id: string): Attendee | undefined {
    return this.attendees.find(a => a.id === id);
  }

  public getCrowdFlow(): Map<string, number> {
    return new Map(this.crowdFlow);
  }

  public getTotalSpending(): number {
    return this.attendees.reduce((sum, a) => sum + a.spending.total, 0);
  }

  public getAverageSatisfaction(): number {
    return this.attendees.reduce((sum, a) => sum + a.satisfaction, 0) / this.attendees.length;
  }
}
