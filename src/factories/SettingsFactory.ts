import { SimulationSettings, SimulationDifficulty, FeatureToggle, Plugin } from '../types';

export class SettingsFactory {
  public static createDefaultSettings(): SimulationSettings {
    return {
      timeScale: 1.0,
      aiComplexity: 0.8,
      realismLevel: 0.9,
      difficulty: 'Normal',
      features: this.createDefaultFeatures(),
      plugins: this.createDefaultPlugins()
    };
  }

  public static createEasySettings(): SimulationSettings {
    return {
      timeScale: 2.0,
      aiComplexity: 0.5,
      realismLevel: 0.7,
      difficulty: 'Easy',
      features: this.createDefaultFeatures(),
      plugins: this.createDefaultPlugins()
    };
  }

  public static createHardSettings(): SimulationSettings {
    return {
      timeScale: 0.5,
      aiComplexity: 0.9,
      realismLevel: 0.95,
      difficulty: 'Hard',
      features: this.createDefaultFeatures(),
      plugins: this.createDefaultPlugins()
    };
  }

  public static createExpertSettings(): SimulationSettings {
    return {
      timeScale: 0.25,
      aiComplexity: 1.0,
      realismLevel: 0.98,
      difficulty: 'Expert',
      features: this.createDefaultFeatures(),
      plugins: this.createDefaultPlugins()
    };
  }

  public static createRealisticSettings(): SimulationSettings {
    return {
      timeScale: 1.0,
      aiComplexity: 1.0,
      realismLevel: 1.0,
      difficulty: 'Realistic',
      features: this.createDefaultFeatures(),
      plugins: this.createDefaultPlugins()
    };
  }

  private static createDefaultFeatures(): FeatureToggle[] {
    return [
      {
        name: 'Weather Simulation',
        enabled: true,
        priority: 1,
        dependencies: []
      },
      {
        name: 'Crowd Behavior',
        enabled: true,
        priority: 1,
        dependencies: []
      },
      {
        name: 'Financial Tracking',
        enabled: true,
        priority: 1,
        dependencies: []
      },
      {
        name: 'Safety Systems',
        enabled: true,
        priority: 1,
        dependencies: []
      },
      {
        name: 'Performance Management',
        enabled: true,
        priority: 2,
        dependencies: ['Crowd Behavior']
      },
      {
        name: 'Vendor Operations',
        enabled: true,
        priority: 2,
        dependencies: ['Financial Tracking']
      },
      {
        name: 'Staff Management',
        enabled: true,
        priority: 2,
        dependencies: ['Safety Systems']
      },
      {
        name: 'Power Management',
        enabled: true,
        priority: 3,
        dependencies: ['Performance Management']
      },
      {
        name: 'Security Systems',
        enabled: true,
        priority: 3,
        dependencies: ['Safety Systems']
      },
      {
        name: 'AI Decision Making',
        enabled: true,
        priority: 4,
        dependencies: ['Crowd Behavior', 'Financial Tracking', 'Safety Systems']
      },
      {
        name: 'Advanced Logistics',
        enabled: false,
        priority: 5,
        dependencies: ['Performance Management', 'Vendor Operations']
      },
      {
        name: 'Environmental Impact',
        enabled: false,
        priority: 5,
        dependencies: ['Power Management', 'Vendor Operations']
      },
      {
        name: 'Social Media Integration',
        enabled: false,
        priority: 6,
        dependencies: ['AI Decision Making']
      },
      {
        name: 'Real-time Analytics',
        enabled: false,
        priority: 6,
        dependencies: ['AI Decision Making']
      },
      {
        name: 'Multi-venue Support',
        enabled: false,
        priority: 7,
        dependencies: ['Advanced Logistics']
      },
      {
        name: 'International Localization',
        enabled: false,
        priority: 7,
        dependencies: ['Social Media Integration']
      }
    ];
  }

  private static createDefaultPlugins(): Plugin[] {
    return [
      {
        name: 'Weather API',
        version: '1.0.0',
        enabled: true,
        config: {
          apiKey: '',
          updateInterval: 300000, // 5 minutes
          forecastHours: 24,
          alerts: true
        }
      },
      {
        name: 'Music Generation',
        version: '1.0.0',
        enabled: false,
        config: {
          aiModel: 'gpt-4',
          genres: ['EDM', 'Rock', 'Pop', 'Jazz'],
          duration: 300, // 5 minutes
          quality: 'high'
        }
      },
      {
        name: 'Translation Service',
        version: '1.0.0',
        enabled: false,
        config: {
          supportedLanguages: ['en', 'es', 'fr', 'de', 'ja', 'zh'],
          autoTranslate: false,
          quality: 'professional'
        }
      },
      {
        name: 'Social Media Bot',
        version: '1.0.0',
        enabled: false,
        config: {
          platforms: ['twitter', 'instagram', 'facebook'],
          autoPost: false,
          sentimentAnalysis: true,
          engagementTracking: true
        }
      },
      {
        name: 'Emergency Services',
        version: '1.0.0',
        enabled: true,
        config: {
          autoDispatch: true,
          responseTime: 300, // 5 minutes
          escalationLevels: 3,
          contactNumbers: {
            police: '911',
            ambulance: '911',
            fire: '911'
          }
        }
      },
      {
        name: 'Financial Analytics',
        version: '1.0.0',
        enabled: true,
        config: {
          realTimeUpdates: true,
          forecasting: true,
          riskAssessment: true,
          reporting: true
        }
      },
      {
        name: 'Crowd Analytics',
        version: '1.0.0',
        enabled: true,
        config: {
          densityMapping: true,
          flowAnalysis: true,
          prediction: true,
          alerts: true
        }
      },
      {
        name: 'Equipment Monitoring',
        version: '1.0.0',
        enabled: true,
        config: {
          realTimeStatus: true,
          predictiveMaintenance: true,
          failureAlerts: true,
          performanceMetrics: true
        }
      }
    ];
  }

  public static createCustomSettings(overrides: Partial<SimulationSettings>): SimulationSettings {
    const defaultSettings = this.createDefaultSettings();
    return { ...defaultSettings, ...overrides };
  }

  public static createSettingsForDifficulty(difficulty: SimulationDifficulty): SimulationSettings {
    switch (difficulty) {
      case 'Easy':
        return this.createEasySettings();
      case 'Normal':
        return this.createDefaultSettings();
      case 'Hard':
        return this.createHardSettings();
      case 'Expert':
        return this.createExpertSettings();
      case 'Realistic':
        return this.createRealisticSettings();
      default:
        return this.createDefaultSettings();
    }
  }

  public static createSettingsForVenueType(venueType: string): SimulationSettings {
    const baseSettings = this.createDefaultSettings();
    
    switch (venueType.toLowerCase()) {
      case 'indoor':
        return {
          ...baseSettings,
          features: baseSettings.features.map(feature => 
            feature.name === 'Weather Simulation' 
              ? { ...feature, enabled: false }
              : feature
          )
        };
      case 'outdoor':
        return {
          ...baseSettings,
          features: baseSettings.features.map(feature => 
            feature.name === 'Weather Simulation' 
              ? { ...feature, enabled: true, priority: 1 }
              : feature
          )
        };
      case 'urban':
        return {
          ...baseSettings,
          features: baseSettings.features.map(feature => 
            feature.name === 'Security Systems' 
              ? { ...feature, enabled: true, priority: 2 }
              : feature
          )
        };
      case 'greenfield':
        return {
          ...baseSettings,
          features: baseSettings.features.map(feature => 
            feature.name === 'Environmental Impact' 
              ? { ...feature, enabled: true, priority: 3 }
              : feature
          )
        };
      default:
        return baseSettings;
    }
  }

  public static createSettingsForFestivalSize(size: 'small' | 'medium' | 'large' | 'mega'): SimulationSettings {
    const baseSettings = this.createDefaultSettings();
    
    switch (size) {
      case 'small':
        return {
          ...baseSettings,
          timeScale: 2.0,
          aiComplexity: 0.6,
          features: baseSettings.features.filter(feature => feature.priority <= 3)
        };
      case 'medium':
        return {
          ...baseSettings,
          timeScale: 1.0,
          aiComplexity: 0.8,
          features: baseSettings.features.filter(feature => feature.priority <= 4)
        };
      case 'large':
        return {
          ...baseSettings,
          timeScale: 0.75,
          aiComplexity: 0.9,
          features: baseSettings.features.filter(feature => feature.priority <= 5)
        };
      case 'mega':
        return {
          ...baseSettings,
          timeScale: 0.5,
          aiComplexity: 1.0,
          features: baseSettings.features
        };
      default:
        return baseSettings;
    }
  }

  public static validateSettings(settings: SimulationSettings): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate time scale
    if (settings.timeScale < 0.1 || settings.timeScale > 10) {
      errors.push('Time scale must be between 0.1 and 10');
    }
    
    // Validate AI complexity
    if (settings.aiComplexity < 0 || settings.aiComplexity > 1) {
      errors.push('AI complexity must be between 0 and 1');
    }
    
    // Validate realism level
    if (settings.realismLevel < 0 || settings.realismLevel > 1) {
      errors.push('Realism level must be between 0 and 1');
    }
    
    // Validate feature dependencies
    const enabledFeatures = settings.features.filter(f => f.enabled);
    for (const feature of enabledFeatures) {
      for (const dependency of feature.dependencies) {
        const dependencyFeature = enabledFeatures.find(f => f.name === dependency);
        if (!dependencyFeature) {
          errors.push(`Feature "${feature.name}" requires "${dependency}" to be enabled`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  public static getRecommendedSettings(
    venueType: string,
    festivalSize: string,
    experienceLevel: string
  ): SimulationSettings {
    let settings = this.createDefaultSettings();
    
    // Apply venue-specific settings
    settings = { ...settings, ...this.createSettingsForVenueType(venueType) };
    
    // Apply size-specific settings
    settings = { ...settings, ...this.createSettingsForFestivalSize(festivalSize as any) };
    
    // Apply experience-level settings
    switch (experienceLevel.toLowerCase()) {
      case 'beginner':
        settings.difficulty = 'Easy';
        settings.timeScale = 2.0;
        settings.aiComplexity = 0.5;
        break;
      case 'intermediate':
        settings.difficulty = 'Normal';
        settings.timeScale = 1.0;
        settings.aiComplexity = 0.8;
        break;
      case 'advanced':
        settings.difficulty = 'Hard';
        settings.timeScale = 0.5;
        settings.aiComplexity = 0.9;
        break;
      case 'expert':
        settings.difficulty = 'Expert';
        settings.timeScale = 0.25;
        settings.aiComplexity = 1.0;
        break;
      case 'professional':
        settings.difficulty = 'Realistic';
        settings.timeScale = 1.0;
        settings.aiComplexity = 1.0;
        break;
    }
    
    return settings;
  }
}
