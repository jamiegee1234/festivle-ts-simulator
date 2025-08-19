import { EventEmitter } from 'events';
import { Festival, Venue, Location } from '../../types';

export class ComplianceEngine extends EventEmitter {
  private festival: Festival;
  private venue: Venue;
  private permits: Map<string, any> = new Map();
  private licenses: Map<string, any> = new Map();
  private complianceChecks: Map<string, any> = new Map();
  private violations: any[] = [];
  private inspections: any[] = [];
  private lastComplianceCheck: Date = new Date();

  constructor(festival: Festival) {
    super();
    this.festival = festival;
    this.venue = festival.venue;
    this.initializePermits();
    this.initializeLicenses();
    this.initializeComplianceChecks();
  }

  private initializePermits(): void {
    // Initialize required permits for the festival
    const requiredPermits = [
      {
        id: 'premises-license',
        type: 'Premises License',
        description: 'License to sell alcohol and host events',
        status: 'Active',
        issuedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        conditions: ['No alcohol sales after 23:00', 'Maximum capacity: 15,000', 'Security required'],
        cost: 5000
      },
      {
        id: 'temporary-event-notice',
        type: 'Temporary Event Notice (TEN)',
        description: 'Permission for temporary event activities',
        status: 'Active',
        issuedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        conditions: ['Event duration: 3 days', 'Noise restrictions apply', 'Local council approval'],
        cost: 1000
      },
      {
        id: 'road-closure',
        type: 'Road Closure Permit',
        description: 'Permission to close roads for festival access',
        status: 'Active',
        issuedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        conditions: ['Emergency access maintained', 'Local resident access', 'Traffic management plan'],
        cost: 2000
      },
      {
        id: 'pyro-license',
        type: 'Pyrotechnics License',
        description: 'Permission to use pyrotechnics and special effects',
        status: 'Active',
        issuedDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        conditions: ['Certified operators only', 'Safety zones required', 'Weather dependent'],
        cost: 3000
      }
    ];

    requiredPermits.forEach(permit => {
      this.permits.set(permit.id, permit);
    });
  }

  private initializeLicenses(): void {
    // Initialize required licenses
    const requiredLicenses = [
      {
        id: 'alcohol-license',
        type: 'Alcohol License',
        description: 'License to sell alcoholic beverages',
        status: 'Active',
        issuedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        conditions: ['Age verification required', 'No sales to intoxicated persons', 'Training required'],
        cost: 3000
      },
      {
        id: 'food-hygiene',
        type: 'Food Hygiene License',
        description: 'License for food service operations',
        status: 'Active',
        issuedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        conditions: ['Regular inspections', 'Staff training', 'HACCP compliance'],
        cost: 1500
      },
      {
        id: 'music-license',
        type: 'Music License (PRS/PPL)',
        description: 'License to play recorded music',
        status: 'Active',
        issuedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        conditions: ['Royalty payments', 'Setlist reporting', 'Cover song permissions'],
        cost: 2500
      }
    ];

    requiredLicenses.forEach(license => {
      this.licenses.set(license.id, license);
    });
  }

  private initializeComplianceChecks(): void {
    // Initialize regular compliance checks
    const checks = [
      {
        id: 'capacity-compliance',
        type: 'Capacity Compliance',
        description: 'Check venue capacity against fire code limits',
        frequency: 'Continuous',
        lastCheck: new Date(),
        nextCheck: new Date(),
        status: 'Passed',
        requirements: ['Fire code compliance', 'Emergency exit accessibility', 'Crowd flow management']
      },
      {
        id: 'noise-compliance',
        type: 'Noise Compliance',
        description: 'Monitor noise levels against local council limits',
        frequency: 'Continuous',
        lastCheck: new Date(),
        nextCheck: new Date(),
        status: 'Passed',
        requirements: ['65 dB limit after 23:00', 'Perimeter monitoring', 'Complaint response']
      },
      {
        id: 'safety-compliance',
        type: 'Safety Compliance',
        description: 'Check safety equipment and procedures',
        frequency: 'Hourly',
        lastCheck: new Date(),
        nextCheck: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        status: 'Passed',
        requirements: ['Fire extinguishers', 'First aid stations', 'Emergency lighting']
      },
      {
        id: 'security-compliance',
        type: 'Security Compliance',
        description: 'Verify security measures and personnel',
        frequency: 'Daily',
        lastCheck: new Date(),
        nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        status: 'Passed',
        requirements: ['Security personnel count', 'Access control', 'Incident response']
      }
    ];

    checks.forEach(check => {
      this.complianceChecks.set(check.id, check);
    });
  }

  public process(currentTime: Date): void {
    // Check permit expiry dates
    this.checkPermitExpiry(currentTime);
    
    // Check license expiry dates
    this.checkLicenseExpiry(currentTime);
    
    // Run scheduled compliance checks
    this.runComplianceChecks(currentTime);
    
    // Check for regulatory violations
    this.checkRegulatoryViolations(currentTime);
    
    // Emit compliance status
    this.emitComplianceStatus();
  }

  private checkPermitExpiry(currentTime: Date): void {
    this.permits.forEach((permit, permitId) => {
      const daysUntilExpiry = (permit.expiryDate.getTime() - currentTime.getTime()) / (24 * 60 * 60 * 1000);
      
      if (daysUntilExpiry <= 0) {
        permit.status = 'Expired';
        this.emit('permitExpired', {
          permitId,
          permit,
          timestamp: currentTime
        });
        
        // Create violation
        const violation = {
          id: `permit-${Date.now()}`,
          type: 'Compliance',
          severity: 'High',
          description: `Permit ${permit.type} has expired`,
          timestamp: currentTime,
          location: { x: 0, y: 0, zone: 'Venue Wide' },
          resolved: false,
          response: {
            responseTime: 0,
            staffInvolved: [],
            actions: ['Immediate permit renewal required', 'Contact licensing authority', 'Assess legal risk'],
            followUp: ['Update permit management', 'Review renewal procedures']
          },
          cost: permit.cost * 2 // Double cost for expired permit
        };
        
        this.violations.push(violation);
        this.emit('complianceViolation', violation);
      } else if (daysUntilExpiry <= 7) {
        permit.status = 'Expiring Soon';
        this.emit('permitExpiringSoon', {
          permitId,
          permit,
          daysUntilExpiry,
          timestamp: currentTime
        });
      }
    });
  }

  private checkLicenseExpiry(currentTime: Date): void {
    this.licenses.forEach((license, licenseId) => {
      const daysUntilExpiry = (license.expiryDate.getTime() - currentTime.getTime()) / (24 * 60 * 60 * 1000);
      
      if (daysUntilExpiry <= 0) {
        license.status = 'Expired';
        this.emit('licenseExpired', {
          licenseId,
          license,
          timestamp: currentTime
        });
        
        // Create violation
        const violation = {
          id: `license-${Date.now()}`,
          type: 'Compliance',
          severity: 'High',
          description: `License ${license.type} has expired`,
          timestamp: currentTime,
          location: { x: 0, y: 0, zone: 'Venue Wide' },
          resolved: false,
          response: {
            responseTime: 0,
            staffInvolved: [],
            actions: ['Immediate license renewal required', 'Contact licensing authority', 'Assess legal risk'],
            followUp: ['Update license management', 'Review renewal procedures']
          },
          cost: license.cost * 2 // Double cost for expired license
        };
        
        this.violations.push(violation);
        this.emit('complianceViolation', violation);
      } else if (daysUntilExpiry <= 30) {
        license.status = 'Expiring Soon';
        this.emit('licenseExpiringSoon', {
          licenseId,
          license,
          daysUntilExpiry,
          timestamp: currentTime
        });
      }
    });
  }

  private runComplianceChecks(currentTime: Date): void {
    this.complianceChecks.forEach((check, checkId) => {
      if (currentTime >= check.nextCheck) {
        // Run the compliance check
        const checkResult = this.performComplianceCheck(check, currentTime);
        
        // Update check status
        check.lastCheck = currentTime;
        check.status = checkResult.passed ? 'Passed' : 'Failed';
        
        // Schedule next check
        switch (check.frequency) {
          case 'Hourly':
            check.nextCheck = new Date(currentTime.getTime() + 60 * 60 * 1000);
            break;
          case 'Daily':
            check.nextCheck = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
            break;
          case 'Weekly':
            check.nextCheck = new Date(currentTime.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
          default:
            check.nextCheck = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
        }
        
        // Emit check result
        this.emit('complianceCheckResult', {
          checkId,
          check,
          result: checkResult,
          timestamp: currentTime
        });
        
        // Create violation if check failed
        if (!checkResult.passed) {
          const violation = {
            id: `compliance-${Date.now()}`,
            type: 'Compliance',
            severity: checkResult.critical ? 'Critical' : 'Moderate',
            description: `Compliance check failed: ${check.description}`,
            timestamp: currentTime,
            location: { x: 0, y: 0, zone: 'Venue Wide' },
            resolved: false,
            response: {
              responseTime: 0,
              staffInvolved: [],
              actions: checkResult.actions || ['Investigate issue', 'Implement corrective action', 'Re-run check'],
              followUp: ['Review procedures', 'Update compliance protocols']
            },
            cost: checkResult.cost || 1000
          };
          
          this.violations.push(violation);
          this.emit('complianceViolation', violation);
        }
      }
    });
  }

  private performComplianceCheck(check: any, currentTime: Date): any {
    switch (check.id) {
      case 'capacity-compliance':
        return this.checkCapacityCompliance();
      case 'noise-compliance':
        return this.checkNoiseCompliance();
      case 'safety-compliance':
        return this.checkSafetyCompliance();
      case 'security-compliance':
        return this.checkSecurityCompliance();
      default:
        return { passed: true, critical: false, cost: 0 };
    }
  }

  private checkCapacityCompliance(): any {
    const currentOccupancy = this.festival.currentAttendees;
    const fireCodeLimit = this.venue.capacity.fireCodeLimit;
    
    if (currentOccupancy > fireCodeLimit) {
      return {
        passed: false,
        critical: true,
        cost: 10000,
        actions: ['Immediate evacuation', 'Stop entry', 'Contact fire department']
      };
    }
    
    return { passed: true, critical: false, cost: 0 };
  }

  private checkNoiseCompliance(): any {
    const hour = new Date().getHours();
    const isAfterCurfew = hour >= 23 || hour <= 7;
    
    if (isAfterCurfew) {
      // Simulate noise level check
      const noiseLevel = 70 + Math.random() * 20; // 70-90 dB
      
      if (noiseLevel > 65) {
        return {
          passed: false,
          critical: false,
          cost: 2000,
          actions: ['Reduce volume', 'Move activities indoors', 'Contact local council']
        };
      }
    }
    
    return { passed: true, critical: false, cost: 0 };
  }

  private checkSafetyCompliance(): any {
    // Simulate safety equipment check
    const safetyScore = Math.random();
    
    if (safetyScore < 0.1) { // 10% chance of safety issue
      return {
        passed: false,
        critical: true,
        cost: 5000,
        actions: ['Check safety equipment', 'Verify emergency procedures', 'Update safety protocols']
      };
    }
    
    return { passed: true, critical: false, cost: 0 };
  }

  private checkSecurityCompliance(): any {
    // Simulate security compliance check
    const securityScore = Math.random();
    
    if (securityScore < 0.05) { // 5% chance of security issue
      return {
        passed: false,
        critical: false,
        cost: 3000,
        actions: ['Review security personnel', 'Check access controls', 'Update security protocols']
      };
    }
    
    return { passed: true, critical: false, cost: 0 };
  }

  private checkRegulatoryViolations(currentTime: Date): void {
    // Check for other regulatory violations
    const hour = currentTime.getHours();
    
    // Check alcohol sales after curfew
    if (hour >= 23 || hour <= 7) {
      // Simulate alcohol sales check
      if (Math.random() < 0.01) { // 1% chance of violation
        const violation = {
          id: `alcohol-${Date.now()}`,
          type: 'Compliance',
          severity: 'Moderate',
          description: 'Alcohol sales detected after curfew hours',
          timestamp: currentTime,
          location: { x: 0, y: 0, zone: 'Bar Areas' },
          resolved: false,
          response: {
            responseTime: 0,
            staffInvolved: [],
            actions: ['Stop alcohol sales', 'Verify license conditions', 'Contact licensing authority'],
            followUp: ['Review sales procedures', 'Update staff training']
          },
          cost: 2000
        };
        
        this.violations.push(violation);
        this.emit('complianceViolation', violation);
      }
    }
  }

  private emitComplianceStatus(): void {
    const status = {
      permits: {
        total: this.permits.size,
        active: Array.from(this.permits.values()).filter(p => p.status === 'Active').length,
        expiringSoon: Array.from(this.permits.values()).filter(p => p.status === 'Expiring Soon').length,
        expired: Array.from(this.permits.values()).filter(p => p.status === 'Expired').length
      },
      licenses: {
        total: this.licenses.size,
        active: Array.from(this.licenses.values()).filter(l => l.status === 'Active').length,
        expiringSoon: Array.from(this.licenses.values()).filter(l => l.status === 'Expiring Soon').length,
        expired: Array.from(this.licenses.values()).filter(l => l.status === 'Expired').length
      },
      compliance: {
        checks: Array.from(this.complianceChecks.values()).map(c => ({
          id: c.id,
          type: c.type,
          status: c.status,
          lastCheck: c.lastCheck,
          nextCheck: c.nextCheck
        })),
        violations: this.violations.length
      }
    };
    
    this.emit('complianceStatus', status);
  }

  // Public API methods
  public getComplianceMetrics(): any {
    return {
      permits: {
        total: this.permits.size,
        active: Array.from(this.permits.values()).filter(p => p.status === 'Active').length,
        expiringSoon: Array.from(this.permits.values()).filter(p => p.status === 'Expiring Soon').length,
        expired: Array.from(this.permits.values()).filter(p => p.status === 'Expired').length
      },
      licenses: {
        total: this.licenses.size,
        active: Array.from(this.licenses.values()).filter(l => l.status === 'Active').length,
        expiringSoon: Array.from(this.licenses.values()).filter(l => l.status === 'Expiring Soon').length,
        expired: Array.from(this.licenses.values()).filter(l => l.status === 'Expired').length
      },
      compliance: {
        checks: Array.from(this.complianceChecks.values()),
        violations: this.violations
      }
    };
  }

  public getPermits(): Map<string, any> {
    return new Map(this.permits);
  }

  public getLicenses(): Map<string, any> {
    return new Map(this.licenses);
  }

  public getViolations(): any[] {
    return [...this.violations];
  }

  public processDecision(decision: any): void {
    // Handle compliance-related decisions
    switch (decision.type) {
      case 'renewPermit':
        // Renew expired permit
        break;
      case 'renewLicense':
        // Renew expired license
        break;
      case 'fixViolation':
        // Fix compliance violation
        break;
    }
  }
}
