import { EventEmitter } from 'events';
import { Festival, SimulationSettings, Incident } from '../../types';

export class SafetyEngine extends EventEmitter {
  private festival: Festival;
  private settings: SimulationSettings;
  private incidents: Incident[] = [];
  private lastCriticalIncident: Incident | null = null;

  constructor(festival: Festival, settings: SimulationSettings) {
    super();
    this.festival = festival;
    this.settings = settings;
  }

  public process(currentTime: Date): void {
    // Check for potential incidents
    this.checkForIncidents(currentTime);
    
    // Update incident status
    this.updateIncidentStatus(currentTime);
  }

  private checkForIncidents(currentTime: Date): void {
    // Random incident generation (very low probability)
    if (Math.random() < 0.0001) {
      this.generateRandomIncident(currentTime);
    }
    
    // Weather-related incidents
    if (this.festival.weather && this.festival.weather.current.precipitation > 20) {
      if (Math.random() < 0.01) {
        this.createIncident('Weather', 'Moderate', 'Slippery conditions causing minor injuries', currentTime, 5000);
      }
    }
    
    // Crowd-related incidents
    if (this.festival.currentAttendees > this.festival.venue.capacity.fireCodeLimit * 0.9) {
      if (Math.random() < 0.005) {
        this.createIncident('Crowd', 'High', 'Near capacity crowd causing safety concerns', currentTime, 15000);
      }
    }
  }

  private generateRandomIncident(currentTime: Date): void {
    const incidentTypes = ['Medical', 'Security', 'Technical', 'Safety'];
    const severities = ['Minor', 'Moderate', 'Major', 'Critical'];
    
    const type = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    let description = '';
    let cost = 0;
    
    switch (type) {
      case 'Medical':
        description = 'Attendee requiring medical attention';
        cost = severity === 'Critical' ? 50000 : severity === 'Major' ? 25000 : severity === 'Moderate' ? 10000 : 5000;
        break;
      case 'Security':
        description = 'Security incident requiring response';
        cost = severity === 'Critical' ? 75000 : severity === 'Major' ? 35000 : severity === 'Moderate' ? 15000 : 7500;
        break;
      case 'Technical':
        description = 'Technical equipment failure';
        cost = severity === 'Critical' ? 40000 : severity === 'Major' ? 20000 : severity === 'Moderate' ? 10000 : 5000;
        break;
      case 'Safety':
        description = 'Safety protocol violation';
        cost = severity === 'Critical' ? 60000 : severity === 'Major' ? 30000 : severity === 'Moderate' ? 15000 : 7500;
        break;
    }
    
    this.createIncident(type || 'Unknown', severity || 'Minor', description, currentTime, cost);
  }

  private createIncident(
    type: string, 
    severity: string, 
    description: string, 
    timestamp: Date, 
    cost: number
  ): void {
    const incident: Incident = {
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      severity: severity as any,
      location: { x: 0, y: 0, zone: 'Main Complex' },
      description,
      timestamp,
      resolved: false,
      response: {
        responseTime: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
        staffInvolved: ['Security', 'Medical'],
        actions: ['Initial response', 'Assessment', 'Resolution'],
        followUp: ['Documentation', 'Review']
      },
      cost
    };
    
    this.incidents.push(incident);
    
    if (severity === 'Critical') {
      this.lastCriticalIncident = incident;
    }
    
    this.emit('incident', incident);
  }

  private updateIncidentStatus(currentTime: Date): void {
    this.incidents.forEach(incident => {
      if (!incident.resolved) {
        // Simulate incident resolution over time
        const timeSinceIncident = currentTime.getTime() - incident.timestamp.getTime();
        const resolutionTime = this.getResolutionTime(incident.severity);
        
        if (timeSinceIncident > resolutionTime) {
          incident.resolved = true;
          this.emit('incidentResolved', incident);
        }
      }
    });
  }

  private getResolutionTime(severity: string): number {
    switch (severity) {
      case 'Minor': return 5 * 60 * 1000; // 5 minutes
      case 'Moderate': return 15 * 60 * 1000; // 15 minutes
      case 'Major': return 45 * 60 * 1000; // 45 minutes
      case 'Critical': return 2 * 60 * 60 * 1000; // 2 hours
      default: return 30 * 60 * 1000; // 30 minutes
    }
  }

  public triggerCapacityViolation(data: any): void {
    this.createIncident(
      'Safety',
      'High',
      'Venue capacity exceeded - fire code violation',
      new Date(),
      25000
    );
  }

  public triggerResponse(incident: Incident): void {
    // Implement response protocols based on incident type
    switch (incident.type) {
      case 'Medical':
        this.emit('medicalResponse', incident);
        break;
      case 'Security':
        this.emit('securityResponse', incident);
        break;
      case 'Technical':
        this.emit('technicalResponse', incident);
        break;
      case 'Safety':
        this.emit('safetyResponse', incident);
        break;
    }
  }

  public updateWeatherImpact(weather: any): void {
    // Adjust safety protocols based on weather
    if (weather.current.lightning) {
      this.createIncident(
        'Weather',
        'Critical',
        'Lightning detected - outdoor activities suspended',
        new Date(),
        10000
      );
    }
    
    if (weather.current.temperature > 35) {
      this.createIncident(
        'Medical',
        'Moderate',
        'Extreme heat conditions - increased medical monitoring',
        new Date(),
        5000
      );
    }
  }

  public triggerEmergencyProtocol(protocol: string): void {
    this.emit('emergencyProtocol', {
      protocol,
      timestamp: new Date(),
      actions: ['Protocol activated', 'Staff notified', 'Response initiated']
    });
  }

  public hasCriticalIncident(): boolean {
    return this.incidents.some(incident => 
      incident.severity === 'Critical' && !incident.resolved
    );
  }

  public getLastCriticalIncident(): Incident | null {
    return this.lastCriticalIncident;
  }

  public getSafetyMetrics(): any {
    const totalIncidents = this.incidents.length;
    const resolvedIncidents = this.incidents.filter(i => i.resolved).length;
    const criticalIncidents = this.incidents.filter(i => i.severity === 'Critical').length;
    
    return {
      incidents: totalIncidents,
      resolved: resolvedIncidents,
      critical: criticalIncidents,
      responseTime: this.calculateAverageResponseTime(),
      compliance: 0.98,
      training: 0.95,
      riskLevel: this.calculateRiskLevel()
    };
  }

  private calculateAverageResponseTime(): number {
    if (this.incidents.length === 0) return 0;
    
    const totalResponseTime = this.incidents.reduce((sum, incident) => 
      sum + incident.response.responseTime, 0
    );
    
    return totalResponseTime / this.incidents.length;
  }

  private calculateRiskLevel(): string {
    const activeIncidents = this.incidents.filter(i => !i.resolved);
    const criticalActive = activeIncidents.filter(i => i.severity === 'Critical').length;
    
    if (criticalActive > 0) return 'Critical';
    if (activeIncidents.length > 5) return 'High';
    if (activeIncidents.length > 2) return 'Medium';
    return 'Low';
  }
}
