import { EventEmitter } from 'events';
import { Festival, Artist, Stage, TechnicalRider, Performance } from '../../types';

export class TechnicalEngine extends EventEmitter {
  private festival: Festival;
  private stageSchedules: Map<string, any[]> = new Map();
  private equipmentStatus: Map<string, any> = new Map();
  private loadInSchedule: Map<string, any> = new Map();
  private loadOutSchedule: Map<string, any> = new Map();
  private soundcheckWindows: Map<string, any> = new Map();
  private changeoverTimers: Map<string, any> = new Map();
  private technicalIssues: any[] = [];

  constructor(festival: Festival) {
    super();
    this.festival = festival;
    this.initializeStages();
    this.initializeEquipment();
    this.generateSchedules();
  }

  private initializeStages(): void {
    this.festival.venue.stages.forEach(stage => {
      this.stageSchedules.set(stage.id, []);
      this.loadInSchedule.set(stage.id, []);
      this.loadOutSchedule.set(stage.id, []);
      this.soundcheckWindows.set(stage.id, []);
      this.changeoverTimers.set(stage.id, []);
    });
  }

  private initializeEquipment(): void {
    this.festival.venue.stages.forEach(stage => {
      if (stage.equipment) {
        Object.entries(stage.equipment).forEach(([equipmentType, equipment]) => {
          const equipmentId = `${stage.id}-${equipmentType}`;
          this.equipmentStatus.set(equipmentId, {
            type: equipmentType,
            status: 'Operational',
            lastMaintenance: new Date(),
            nextMaintenance: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            issues: []
          });
        });
      }
    });
  }

  private generateSchedules(): void {
    this.festival.venue.stages.forEach(stage => {
      const stagePerformances = this.festival.schedule.performances.filter(
        p => p.stageId === stage.id
      );
      
      // Sort performances by start time
      stagePerformances.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      
      // Generate load-in, soundcheck, and load-out schedules
      stagePerformances.forEach((performance, index) => {
        const artist = this.festival.artists.find(a => a.id === performance.artistId);
        if (!artist) return;
        
        // Load-in window (2-4 hours before performance)
        const loadInStart = new Date(performance.startTime.getTime() - (3 * 60 * 60 * 1000));
        const loadInEnd = new Date(performance.startTime.getTime() - (1 * 60 * 60 * 1000));
        
        this.loadInSchedule.get(stage.id)?.push({
          artistId: artist.id,
          artistName: artist.name,
          startTime: loadInStart,
          endTime: loadInEnd,
          duration: 2 * 60 * 60 * 1000, // 2 hours
          status: 'Scheduled',
          requirements: artist.technicalRider.requirements || []
        });
        
        // Soundcheck window (1 hour before performance)
        const soundcheckStart = new Date(performance.startTime.getTime() - (1 * 60 * 60 * 1000));
        const soundcheckEnd = new Date(performance.startTime.getTime() - (15 * 60 * 1000));
        
        this.soundcheckWindows.get(stage.id)?.push({
          artistId: artist.id,
          artistName: artist.name,
          startTime: soundcheckStart,
          endTime: soundcheckEnd,
          duration: 45 * 60 * 1000, // 45 minutes
          status: 'Scheduled',
          completed: false
        });
        
        // Load-out window (30 minutes after performance)
        const loadOutStart = new Date(performance.endTime.getTime() + (15 * 60 * 1000));
        const loadOutEnd = new Date(performance.endTime.getTime() + (1.5 * 60 * 60 * 1000));
        
        this.loadOutSchedule.get(stage.id)?.push({
          artistId: artist.id,
          artistName: artist.name,
          startTime: loadOutStart,
          endTime: loadOutEnd,
          duration: 1.25 * 60 * 60 * 1000, // 1.25 hours
          status: 'Scheduled'
        });
        
        // Changeover timer (if there's a next performance)
        if (index < stagePerformances.length - 1) {
          const nextPerformance = stagePerformances[index + 1];
          if (nextPerformance) {
            const changeoverDuration = this.calculateChangeoverTime(artist, 
              this.festival.artists.find(a => a.id === nextPerformance.artistId));
            
            this.changeoverTimers.get(stage.id)?.push({
              fromArtist: artist.name,
              toArtist: this.festival.artists.find(a => a.id === nextPerformance.artistId)?.name || 'Unknown',
              startTime: performance.endTime,
              endTime: nextPerformance.startTime,
              duration: changeoverDuration,
              status: 'Scheduled',
              critical: changeoverDuration < 30 * 60 * 1000 // Less than 30 minutes is critical
            });
          }
        }
      });
    });
  }

  private calculateChangeoverTime(currentArtist: Artist, nextArtist: Artist | undefined): number {
    if (!nextArtist) return 0;
    
    let baseTime = 15 * 60 * 1000; // 15 minutes base
    
    // Add time for equipment changes
    const currentEquipment = currentArtist.technicalRider.backline || [];
    const nextEquipment = nextArtist.technicalRider.backline || [];
    
    const equipmentChanges = this.calculateEquipmentChanges(currentEquipment, nextEquipment);
    baseTime += equipmentChanges * 5 * 60 * 1000; // 5 minutes per equipment change
    
    // Add time for stage plot differences
    const plotComplexity = this.calculatePlotComplexity(nextArtist.technicalRider);
    baseTime += plotComplexity * 10 * 60 * 1000; // 10 minutes per complexity level
    
    return baseTime;
  }

  private calculateEquipmentChanges(current: any[], next: any[]): number {
    let changes = 0;
    
    // Count equipment that needs to be changed
    current.forEach(currentEq => {
      const matchingNext = next.find(n => n.type === currentEq.type);
      if (!matchingNext || matchingNext.quantity !== currentEq.quantity) {
        changes++;
      }
    });
    
    // Count new equipment needed
    next.forEach(nextEq => {
      const matchingCurrent = current.find(c => c.type === nextEq.type);
      if (!matchingCurrent) {
        changes++;
      }
    });
    
    return changes;
  }

  private calculatePlotComplexity(technicalRider: TechnicalRider): number {
    let complexity = 1; // Base complexity
    
    // Add complexity for special effects
    if (technicalRider.specialEffects && technicalRider.specialEffects.length > 0) {
      complexity += technicalRider.specialEffects.length * 0.5;
    }
    
    // Add complexity for lighting requirements
    if (technicalRider.lightingRequirements) {
      complexity += 1;
    }
    
    // Add complexity for power requirements
    if (technicalRider.powerRequirements) {
      complexity += 0.5;
    }
    
    return Math.min(complexity, 5); // Cap at 5
  }

  public process(currentTime: Date): void {
    // Update equipment status
    this.updateEquipmentStatus(currentTime);
    
    // Check for technical issues
    this.checkTechnicalIssues(currentTime);
    
    // Update stage schedules
    this.updateStageSchedules(currentTime);
    
    // Emit technical status
    this.emitTechnicalStatus();
  }

  private updateEquipmentStatus(currentTime: Date): void {
    this.equipmentStatus.forEach((equipment, equipmentId) => {
      // Check if maintenance is due
      if (currentTime >= equipment.nextMaintenance) {
        equipment.status = 'Maintenance';
        equipment.lastMaintenance = currentTime;
        equipment.nextMaintenance = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
        
        this.emit('equipmentMaintenance', {
          equipmentId,
          equipment,
          timestamp: currentTime
        });
      }
      
      // Random equipment failures (low probability)
      if (Math.random() < 0.001 && equipment.status === 'Operational') { // 0.1% chance per tick
        equipment.status = 'Failed';
        equipment.issues.push({
          type: 'Random Failure',
          timestamp: currentTime,
          description: 'Equipment malfunction detected'
        });
        
        this.emit('equipmentFailure', {
          equipmentId,
          equipment,
          timestamp: currentTime
        });
      }
    });
  }

  private checkTechnicalIssues(currentTime: Date): void {
    // Check for missed soundchecks
    this.soundcheckWindows.forEach((windows, stageId) => {
      windows.forEach((window: any) => {
        if (currentTime > window.endTime && !window.completed && window.status === 'Scheduled') {
          window.status = 'Missed';
          
          const issue = {
            id: `soundcheck-${Date.now()}`,
            type: 'Technical',
            severity: 'Moderate',
            description: `Soundcheck missed for ${window.artistName} on stage ${stageId}`,
            timestamp: currentTime,
            location: { x: 0, y: 0, zone: stageId },
            resolved: false,
            response: {
              responseTime: 0,
              staffInvolved: [],
              actions: ['Reschedule soundcheck', 'Assess technical readiness', 'Update performance schedule'],
              followUp: ['Review soundcheck procedures', 'Update artist communications']
            },
            cost: 500 // Cost of missed soundcheck
          };
          
          this.technicalIssues.push(issue);
          this.emit('technicalIssue', issue);
        }
      });
    });
    
    // Check for changeover delays
    this.changeoverTimers.forEach((timers, stageId) => {
      timers.forEach((timer: any) => {
        if (currentTime > timer.endTime && timer.status === 'Scheduled') {
          timer.status = 'Delayed';
          
          if (timer.critical) {
            const issue = {
              id: `changeover-${Date.now()}`,
              type: 'Technical',
              severity: 'High',
              description: `Critical changeover delay on stage ${stageId} from ${timer.fromArtist} to ${timer.toArtist}`,
              timestamp: currentTime,
              location: { x: 0, y: 0, zone: stageId },
              resolved: false,
              response: {
                responseTime: 0,
                staffInvolved: [],
                actions: ['Expedite changeover', 'Notify next artist', 'Consider performance delay'],
                followUp: ['Review changeover procedures', 'Optimize stage setup']
              },
              cost: 1000 // Cost of changeover delay
            };
            
            this.technicalIssues.push(issue);
            this.emit('technicalIssue', issue);
          }
        }
      });
    });
  }

  private updateStageSchedules(currentTime: Date): void {
    // Update load-in/out statuses based on current time
    this.loadInSchedule.forEach((schedules, stageId) => {
      schedules.forEach((schedule: any) => {
        if (currentTime >= schedule.startTime && currentTime <= schedule.endTime) {
          schedule.status = 'In Progress';
        } else if (currentTime > schedule.endTime && schedule.status === 'Scheduled') {
          schedule.status = 'Completed';
        }
      });
    });
    
    this.loadOutSchedule.forEach((schedules, stageId) => {
      schedules.forEach((schedule: any) => {
        if (currentTime >= schedule.startTime && currentTime <= schedule.endTime) {
          schedule.status = 'In Progress';
        } else if (currentTime > schedule.endTime && schedule.status === 'Scheduled') {
          schedule.status = 'Completed';
        }
      });
    });
  }

  private emitTechnicalStatus(): void {
    const status = {
      equipment: {
        total: this.equipmentStatus.size,
        operational: Array.from(this.equipmentStatus.values()).filter(e => e.status === 'Operational').length,
        maintenance: Array.from(this.equipmentStatus.values()).filter(e => e.status === 'Maintenance').length,
        failed: Array.from(this.equipmentStatus.values()).filter(e => e.status === 'Failed').length
      },
      stages: this.festival.venue.stages.map(stage => ({
        id: stage.id,
        name: stage.name,
        loadInSchedules: this.loadInSchedule.get(stage.id) || [],
        soundcheckWindows: this.soundcheckWindows.get(stage.id) || [],
        changeoverTimers: this.changeoverTimers.get(stage.id) || [],
        loadOutSchedules: this.loadOutSchedule.get(stage.id) || []
      })),
      issues: this.technicalIssues.length
    };
    
    this.emit('technicalStatus', status);
  }

  // Public API methods
  public getTechnicalMetrics(): any {
    return {
      equipment: {
        total: this.equipmentStatus.size,
        operational: Array.from(this.equipmentStatus.values()).filter(e => e.status === 'Operational').length,
        maintenance: Array.from(this.equipmentStatus.values()).filter(e => e.status === 'Maintenance').length,
        failed: Array.from(this.equipmentStatus.values()).filter(e => e.status === 'Failed').length
      },
      stages: this.festival.venue.stages.map(stage => ({
        id: stage.id,
        name: stage.name,
        loadInSchedules: this.loadInSchedule.get(stage.id) || [],
        soundcheckWindows: this.soundcheckWindows.get(stage.id) || [],
        changeoverTimers: this.changeoverTimers.get(stage.id) || [],
        loadOutSchedules: this.loadOutSchedule.get(stage.id) || []
      })),
      issues: this.technicalIssues
    };
  }

  public getStageSchedule(stageId: string): any {
    return {
      loadIn: this.loadInSchedule.get(stageId) || [],
      soundcheck: this.soundcheckWindows.get(stageId) || [],
      changeover: this.changeoverTimers.get(stageId) || [],
      loadOut: this.loadOutSchedule.get(stageId) || []
    };
  }

  public getEquipmentStatus(): Map<string, any> {
    return new Map(this.equipmentStatus);
  }

  public processDecision(decision: any): void {
    // Handle technical-related decisions
    switch (decision.type) {
      case 'scheduleMaintenance':
        // Schedule equipment maintenance
        break;
      case 'rescheduleSoundcheck':
        // Reschedule missed soundcheck
        break;
      case 'expediteChangeover':
        // Expedite stage changeover
        break;
    }
  }
}
