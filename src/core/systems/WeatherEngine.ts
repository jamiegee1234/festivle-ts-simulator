import { EventEmitter } from 'events';
import { WeatherSystem, SimulationSettings } from '../../types';
import { createNoise2D } from 'simplex-noise';
import Chance from 'chance';

export class WeatherEngine extends EventEmitter {
  private weather: WeatherSystem;
  private settings: SimulationSettings;
  private noise2D: ReturnType<typeof createNoise2D>;
  private chance: Chance;
  private baseTime: number;
  private alerts: any[] = [];

  constructor(weather: WeatherSystem, settings: SimulationSettings) {
    super();
    this.weather = weather;
    this.settings = settings;
    this.noise2D = createNoise2D();
    this.chance = new Chance();
    this.baseTime = Date.now();
  }

  public process(currentTime: Date): void {
    // Update current weather conditions
    this.updateCurrentWeather(currentTime);
    
    // Update forecasts
    this.updateForecasts(currentTime);
    
    // Check for weather alerts
    this.checkWeatherAlerts(currentTime);
    
    // Calculate impact on festival operations
    this.calculateWeatherImpact();
    
    // Emit weather change event if significant changes occurred
    if (this.hasSignificantChanges()) {
      this.emit('weatherChange', this.weather);
    }
  }

  private updateCurrentWeather(currentTime: Date): void {
    const timeOffset = (currentTime.getTime() - this.baseTime) / (1000 * 60 * 60); // hours
    
    // Use noise function for realistic weather patterns
    const temperatureNoise = this.noise2D(timeOffset * 0.1, 0);
    const humidityNoise = this.noise2D(timeOffset * 0.1, 1);
    const windNoise = this.noise2D(timeOffset * 0.1, 2);
    const precipitationNoise = this.noise2D(timeOffset * 0.1, 3);

    // Base weather parameters (can be customized per venue)
    const baseTemp = 22; // Celsius
    const baseHumidity = 60; // Percentage
    const baseWindSpeed = 5; // km/h
    const basePrecipitation = 0; // mm

    // Apply noise and time-based variations
    this.weather.current.temperature = this.clamp(
      baseTemp + temperatureNoise * 15 + Math.sin(timeOffset * 0.5) * 5,
      -10, 40
    );

    this.weather.current.humidity = this.clamp(
      baseHumidity + humidityNoise * 20 + Math.sin(timeOffset * 0.3) * 10,
      20, 100
    );

    this.weather.current.windSpeed = this.clamp(
      baseWindSpeed + Math.abs(windNoise) * 20 + Math.sin(timeOffset * 0.2) * 3,
      0, 50
    );

    this.weather.current.windDirection = (timeOffset * 10 + windNoise * 180) % 360;

    // Precipitation logic
    if (precipitationNoise > 0.7 && this.weather.current.humidity > 80) {
      this.weather.current.precipitation = this.clamp(
        Math.abs(precipitationNoise) * 10,
        0, 50
      );
    } else {
      this.weather.current.precipitation = Math.max(0, this.weather.current.precipitation - 0.1);
    }

    // Update other weather parameters
    this.weather.current.visibility = this.calculateVisibility();
    this.weather.current.uvIndex = this.calculateUVIndex(currentTime);
    this.weather.current.lightning = this.calculateLightningProbability();
  }

  private updateForecasts(currentTime: Date): void {
    const forecastHours = [1, 3, 6, 12, 24]; // Forecast intervals
    
    this.weather.forecast = forecastHours.map(hours => {
      const forecastTime = new Date(currentTime.getTime() + hours * 60 * 60 * 1000);
      const timeOffset = (forecastTime.getTime() - this.baseTime) / (1000 * 60 * 60);
      
      // Generate forecast conditions with increasing uncertainty
      const uncertainty = hours / 24; // More uncertainty for longer forecasts
      const noise = this.noise2D(timeOffset * 0.1, hours);
      
      const forecastCondition: any = {
        temperature: this.weather.current.temperature + noise * 10 * uncertainty,
        humidity: this.clamp(this.weather.current.humidity + noise * 15 * uncertainty, 20, 100),
        windSpeed: this.clamp(this.weather.current.windSpeed + Math.abs(noise) * 5 * uncertainty, 0, 50),
        windDirection: (this.weather.current.windDirection + noise * 30 * uncertainty) % 360,
        precipitation: Math.max(0, this.weather.current.precipitation + noise * 5 * uncertainty),
        visibility: this.calculateVisibility(),
        uvIndex: this.calculateUVIndex(forecastTime),
        lightning: this.calculateLightningProbability()
      };

      const impact: any = this.calculateImpactForCondition(forecastCondition);
      
      return {
        timestamp: forecastTime,
        condition: forecastCondition,
        confidence: Math.max(0.1, 1 - uncertainty),
        impact
      };
    });
  }

  private checkWeatherAlerts(currentTime: Date): void {
    // Check for extreme weather conditions
    const alerts: any[] = [];

    // Temperature alerts
    if (this.weather.current.temperature > 35) {
      alerts.push({
        id: this.generateAlertId(),
        type: 'Heat Warning',
        severity: 'High',
        description: 'Extreme heat conditions detected',
        startTime: currentTime,
        endTime: new Date(currentTime.getTime() + 2 * 60 * 60 * 1000),
        actions: ['Increase water availability', 'Monitor crowd for heat stress', 'Consider performance delays']
      });
    } else if (this.weather.current.temperature < 0) {
      alerts.push({
        id: this.generateAlertId(),
        type: 'Freezing Warning',
        severity: 'Medium',
        description: 'Freezing temperatures detected',
        startTime: currentTime,
        endTime: new Date(currentTime.getTime() + 2 * 60 * 60 * 1000),
        actions: ['Provide warm areas', 'Monitor equipment for freezing', 'Adjust outdoor activities']
      });
    }

    // Wind alerts
    if (this.weather.current.windSpeed > 30) {
      alerts.push({
        id: this.generateAlertId(),
        type: 'High Wind Warning',
        severity: 'High',
        description: 'High wind conditions detected',
        startTime: currentTime,
        endTime: new Date(currentTime.getTime() + 1 * 60 * 60 * 1000),
        actions: ['Secure loose equipment', 'Monitor stage structures', 'Consider performance delays']
      });
    }

    // Precipitation alerts
    if (this.weather.current.precipitation > 20) {
      alerts.push({
        id: this.generateAlertId(),
        type: 'Heavy Rain Warning',
        severity: 'Medium',
        description: 'Heavy precipitation detected',
        startTime: currentTime,
        endTime: new Date(currentTime.getTime() + 3 * 60 * 60 * 1000),
        actions: ['Activate rain covers', 'Monitor ground conditions', 'Adjust crowd flow']
      });
    }

    // Lightning alerts
    if (this.weather.current.lightning) {
      alerts.push({
        id: this.generateAlertId(),
        type: 'Lightning Warning',
        severity: 'Critical',
        description: 'Lightning detected in area',
        startTime: currentTime,
        endTime: new Date(currentTime.getTime() + 30 * 60 * 1000),
        actions: ['Evacuate open areas', 'Pause outdoor performances', 'Seek shelter immediately']
      });
    }

    // Add new alerts
    this.weather.alerts = [...this.weather.alerts, ...alerts];
    
    // Remove expired alerts
    this.weather.alerts = this.weather.alerts.filter(alert => 
      alert.endTime > currentTime
    );

    // Emit alert events
    alerts.forEach(alert => {
      this.emit('weatherAlert', alert);
    });
  }

  private calculateWeatherImpact(): void {
    this.weather.impact = this.calculateImpactForCondition(this.weather.current);
  }

  private calculateImpactForCondition(condition: any): any {
    let crowdImpact = 0;
    let equipmentImpact = 0;
    let logisticsImpact = 0;
    let safetyImpact = 0;
    let revenueImpact = 0;

    // Temperature impact
    if (condition.temperature > 30 || condition.temperature < 5) {
      crowdImpact += 0.3;
      safetyImpact += 0.2;
      revenueImpact += 0.1;
    }

    // Humidity impact
    if (condition.humidity > 80) {
      equipmentImpact += 0.2;
      logisticsImpact += 0.1;
    }

    // Wind impact
    if (condition.windSpeed > 20) {
      equipmentImpact += 0.4;
      safetyImpact += 0.3;
      logisticsImpact += 0.2;
    }

    // Precipitation impact
    if (condition.precipitation > 10) {
      crowdImpact += 0.4;
      equipmentImpact += 0.3;
      logisticsImpact += 0.4;
      revenueImpact += 0.2;
    }

    // Visibility impact
    if (condition.visibility < 1000) {
      safetyImpact += 0.3;
      logisticsImpact += 0.2;
    }

    // Lightning impact
    if (condition.lightning) {
      safetyImpact += 0.8;
      equipmentImpact += 0.6;
      logisticsImpact += 0.5;
      revenueImpact += 0.4;
    }

    return {
      onCrowd: Math.min(1, crowdImpact),
      onEquipment: Math.min(1, equipmentImpact),
      onLogistics: Math.min(1, logisticsImpact),
      onSafety: Math.min(1, safetyImpact),
      onRevenue: Math.min(1, revenueImpact)
    };
  }

  private calculateVisibility(): number {
    // Base visibility in meters
    let visibility = 10000;
    
    // Reduce visibility based on precipitation
    if (this.weather.current.precipitation > 0) {
      visibility -= this.weather.current.precipitation * 100;
    }
    
    // Reduce visibility based on humidity
    if (this.weather.current.humidity > 90) {
      visibility -= 2000;
    }
    
    return Math.max(100, visibility);
  }

  private calculateUVIndex(currentTime: Date): number {
    const hour = currentTime.getHours();
    const month = currentTime.getMonth();
    
    // UV index is highest during summer months and peak hours
    let baseUV = 3;
    
    if (month >= 5 && month <= 8) { // Summer months
      baseUV = 7;
    }
    
    if (hour >= 10 && hour <= 16) { // Peak UV hours
      baseUV += 2;
    }
    
    // Add some randomness
    baseUV += this.chance.floating({ min: -1, max: 1 });
    
    return Math.max(0, Math.min(11, Math.round(baseUV)));
  }

  private calculateLightningProbability(): boolean {
    // Lightning probability based on atmospheric conditions
    if (this.weather.current.precipitation > 15 && 
        this.weather.current.humidity > 85 && 
        this.weather.current.temperature > 20) {
      return this.chance.bool({ likelihood: 0.3 });
    }
    return false;
  }

  private hasSignificantChanges(): boolean {
    // Check if weather has changed significantly since last update
    // This is a simplified check - in a real implementation, you'd track previous values
    return true; // For now, always emit changes
  }

  private generateAlertId(): string {
    return `weather_alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  // Public API methods
  public getWeatherMetrics(): any {
    return {
      current: this.weather.current,
      forecast: this.weather.forecast,
      alerts: this.weather.alerts,
      impact: this.weather.impact
    };
  }

  public getCurrentWeather(): any {
    return this.weather.current;
  }

  public getForecast(): any[] {
    return this.weather.forecast;
  }

  public getActiveAlerts(): any[] {
    return this.weather.alerts.filter(alert => 
      alert.endTime > new Date()
    );
  }

  public getWeatherImpact(): any {
    return this.weather.impact;
  }

  public isWeatherSafe(): boolean {
    return this.weather.impact.onSafety < 0.5;
  }

  public getWeatherRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.weather.impact.onSafety > 0.7) {
      recommendations.push('Consider postponing outdoor activities');
    }
    
    if (this.weather.impact.onEquipment > 0.5) {
      recommendations.push('Protect sensitive equipment from weather');
    }
    
    if (this.weather.impact.onCrowd > 0.6) {
      recommendations.push('Provide shelter and comfort for attendees');
    }
    
    return recommendations;
  }

  // Weather modification methods (for testing or special events)
  public setWeatherCondition(condition: Partial<any>): void {
    this.weather.current = { ...this.weather.current, ...condition };
    this.calculateWeatherImpact();
    this.emit('weatherChange', this.weather);
  }

  public triggerWeatherEvent(eventType: string, duration: number): void {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    
    const alert: any = {
      id: this.generateAlertId(),
      type: eventType,
      severity: 'High',
      description: `Manual weather event triggered: ${eventType}`,
      startTime,
      endTime,
      actions: ['Monitor conditions', 'Adjust operations as needed']
    };
    
    this.weather.alerts.push(alert);
    this.emit('weatherAlert', alert);
  }
}
