import { SimulationEngine } from './core/SimulationEngine';
import { Festival, SimulationSettings } from './types';
import { FestivalFactory } from './factories/FestivalFactory';
import { SettingsFactory } from './factories/SettingsFactory';
import * as readline from 'readline';

class FestivleSimulator {
  private simulationEngine: SimulationEngine | null = null;
  private isRunning: boolean = false;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    process.on('SIGINT', () => {
      console.log('\nShutting down simulator...');
      this.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\nShutting down simulator...');
      this.shutdown();
      process.exit(0);
    });
  }

  public async start(): Promise<void> {
    console.log('🎪 Welcome to Festivle - The Ultimate Festival Simulator! 🎪\n');
    
    try {
      // Initialize festival and settings
      const festival = await this.initializeFestival();
      const settings = SettingsFactory.createDefaultSettings();
      
      // Create simulation engine
      this.simulationEngine = new SimulationEngine(festival, settings);
      
      // Set up simulation event listeners
      this.setupSimulationEvents();
      
      // Start the simulation
      await this.startSimulation();
      
    } catch (error) {
      console.error('Failed to start simulator:', error);
      process.exit(1);
    }
  }

  private async initializeFestival(): Promise<Festival> {
    console.log('🎵 Initializing Festival Environment...\n');
    
    // For now, create a default festival
    // In a full implementation, this would load from config or user input
    const festival = FestivalFactory.createDefaultFestival();
    
    console.log(`✅ Festival "${festival.name}" initialized successfully!`);
    console.log(`📍 Venue: ${festival.venue.name}`);
    console.log(`👥 Capacity: ${festival.capacity.toLocaleString()} attendees`);
    console.log(`🎭 Genre: ${festival.genre}`);
    console.log(`🌍 Theme: ${festival.theme}`);
    console.log(`📅 Duration: ${festival.startDate.toLocaleDateString()} - ${festival.endDate.toLocaleDateString()}\n`);
    
    return festival;
  }

  private setupSimulationEvents(): void {
    if (!this.simulationEngine) return;

    this.simulationEngine.on('simulationStarted', (data) => {
      console.log('🚀 Simulation started!');
      console.log(`⏰ Current time: ${data.time.toLocaleString()}\n`);
    });

    this.simulationEngine.on('tick', (data) => {
      if (data.time.getMinutes() % 15 === 0) { // Log every 15 minutes
        console.log(`⏰ ${data.time.toLocaleTimeString()} - Festival Status: ${data.festival.status}`);
        console.log(`👥 Attendees: ${data.metrics.attendance?.total || 0}`);
        console.log(`💰 Revenue: $${(data.metrics.financial?.revenue || 0).toLocaleString()}`);
        console.log(`🌤️ Weather: ${data.metrics.weather?.current?.temperature}°C, ${data.metrics.weather?.current?.precipitation}mm rain\n`);
      }
    });

    this.simulationEngine.on('weatherChange', (data) => {
      console.log(`🌤️ Weather Update: ${data.weather.current.temperature}°C, ${data.weather.current.precipitation}mm rain`);
    });

    this.simulationEngine.on('incident', (data) => {
      console.log(`🚨 Incident: ${data.incident.type} - ${data.incident.description}`);
    });

    this.simulationEngine.on('criticalIncident', (data) => {
      console.log(`🚨🚨 CRITICAL INCIDENT: ${data.incident.type} - ${data.incident.description}`);
    });

    this.simulationEngine.on('simulationStopped', (data) => {
      console.log('🏁 Simulation completed!');
      this.displayFinalResults(data);
    });

    this.simulationEngine.on('error', (data) => {
      console.error('❌ Simulation error:', data.error);
    });
  }

  private async initializeSimulation(): Promise<void> {
    if (!this.simulationEngine) return;

    console.log('🎮 Starting Festival Simulation...\n');
    console.log('Available commands:');
    console.log('  start     - Start the simulation');
    console.log('  pause     - Pause the simulation');
    console.log('  resume    - Resume the simulation');
    console.log('  stop      - Stop the simulation');
    console.log('  status    - Show current status');
    console.log('  metrics   - Show current metrics');
    console.log('  help      - Show this help');
    console.log('  quit      - Exit the simulator\n');

    // Start the simulation
    this.simulationEngine.start();
    this.isRunning = true;

    // Start CLI interface
    this.startCLI();
  }

  private startCLI(): void {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'festivle> '
    });

    rl.prompt();

    rl.on('line', (line) => {
      const command = line.trim().toLowerCase();
      
      switch (command) {
        case 'start':
          this.startSimulation();
          break;
        case 'pause':
          this.pauseSimulation();
          break;
        case 'resume':
          this.resumeSimulation();
          break;
        case 'stop':
          this.stopSimulation();
          break;
        case 'status':
          this.showStatus();
          break;
        case 'metrics':
          this.showMetrics();
          break;
        case 'help':
          this.showHelp();
          break;
        case 'quit':
        case 'exit':
          this.shutdown();
          rl.close();
          return;
        default:
          if (command) {
            console.log(`Unknown command: ${command}. Type 'help' for available commands.`);
          }
      }
      
      rl.prompt();
    });

    rl.on('close', () => {
      this.shutdown();
      process.exit(0);
    });
  }

  private startSimulation(): void {
    if (this.simulationEngine && !this.isRunning) {
      this.simulationEngine.start();
      this.isRunning = true;
      console.log('🚀 Simulation started!');
    } else {
      console.log('Simulation is already running or not initialized.');
    }
  }

  private pauseSimulation(): void {
    if (this.simulationEngine && this.isRunning) {
      this.simulationEngine.pause();
      this.isRunning = false;
      console.log('⏸️ Simulation paused.');
    } else {
      console.log('Simulation is not running or not initialized.');
    }
  }

  private resumeSimulation(): void {
    if (this.simulationEngine && !this.isRunning) {
      this.simulationEngine.resume();
      this.isRunning = true;
      console.log('▶️ Simulation resumed.');
    } else {
      console.log('Simulation is already running or not initialized.');
    }
  }

  private stopSimulation(): void {
    if (this.simulationEngine) {
      this.simulationEngine.stop();
      this.isRunning = false;
      console.log('⏹️ Simulation stopped.');
    } else {
      console.log('Simulation not initialized.');
    }
  }

  private showStatus(): void {
    if (!this.simulationEngine) {
      console.log('Simulation not initialized.');
      return;
    }

    const festival = this.simulationEngine.getFestival();
    const status = this.simulationEngine.getFestivalStatus();
    const time = this.simulationEngine.getCurrentTime();
    const isRunning = this.simulationEngine.isSimulationRunning();

    console.log('\n📊 Festival Status:');
    console.log(`🎪 Name: ${festival.name}`);
    console.log(`📅 Date: ${time.toLocaleDateString()}`);
    console.log(`⏰ Time: ${time.toLocaleTimeString()}`);
    console.log(`🔄 Status: ${status}`);
    console.log(`▶️ Running: ${isRunning ? 'Yes' : 'No'}`);
    console.log(`👥 Attendees: ${festival.currentAttendees.toLocaleString()}/${festival.capacity.toLocaleString()}`);
    console.log(`💰 Budget: $${festival.budget.total.toLocaleString()}`);
    console.log(`🌤️ Weather: ${festival.weather.current.temperature}°C, ${festival.weather.current.precipitation}mm rain\n`);
  }

  private showMetrics(): void {
    if (!this.simulationEngine) {
      console.log('Simulation not initialized.');
      return;
    }

    const metrics = this.simulationEngine.getMetrics();
    const incidents = this.simulationEngine.getIncidents();
    const alerts = this.simulationEngine.getAlerts();

    console.log('\n📈 Current Metrics:');
    
    if (metrics.attendance) {
      console.log(`👥 Attendance: ${metrics.attendance.total || 0} total`);
      console.log(`📊 Average Satisfaction: ${((metrics.attendance.averageSatisfaction || 0) * 100).toFixed(1)}%`);
    }
    
    if (metrics.financial) {
      console.log(`💰 Revenue: $${(metrics.financial.revenue || 0).toLocaleString()}`);
      console.log(`💸 Costs: $${(metrics.financial.costs || 0).toLocaleString()}`);
      console.log(`💵 Profit: $${(metrics.financial.profit || 0).toLocaleString()}`);
    }
    
    if (metrics.safety) {
      console.log(`🚨 Incidents: ${metrics.safety.incidents || 0}`);
    }
    
    if (metrics.weather) {
      console.log(`🌤️ Weather Impact: ${((metrics.weather.impact?.onSafety || 0) * 100).toFixed(1)}% safety impact`);
    }

    if (incidents.length > 0) {
      console.log(`\n🚨 Recent Incidents:`);
      incidents.slice(-3).forEach(incident => {
        console.log(`  - ${incident.type}: ${incident.description}`);
      });
    }

    if (alerts.length > 0) {
      console.log(`\n⚠️ Active Alerts:`);
      alerts.slice(-3).forEach(alert => {
        console.log(`  - ${alert.type}: ${alert.description}`);
      });
    }
    
    console.log('');
  }

  private showHelp(): void {
    console.log('\n🎮 Available Commands:');
    console.log('  start     - Start the simulation');
    console.log('  pause     - Pause the simulation');
    console.log('  resume    - Resume the simulation');
    console.log('  stop      - Stop the simulation');
    console.log('  status    - Show current festival status');
    console.log('  metrics   - Show current metrics and analytics');
    console.log('  help      - Show this help message');
    console.log('  quit      - Exit the simulator\n');
  }

  private displayFinalResults(data: any): void {
    console.log('\n🏆 Final Results:');
    console.log(`🎪 Festival: ${data.festival.name}`);
    console.log(`📅 Completed: ${data.time.toLocaleString()}`);
    
    if (data.festival.metrics) {
      const metrics = data.festival.metrics;
      console.log(`👥 Total Attendees: ${metrics.attendance?.total || 0}`);
      console.log(`💰 Total Revenue: $${(metrics.financial?.revenue || 0).toLocaleString()}`);
      console.log(`💵 Total Profit: $${(metrics.financial?.profit || 0).toLocaleString()}`);
      console.log(`🚨 Total Incidents: ${metrics.safety?.incidents || 0}`);
    }
    
    console.log('\n🎉 Thank you for using Festivle! 🎉\n');
  }

  private shutdown(): void {
    if (this.simulationEngine && this.isRunning) {
      this.simulationEngine.stop();
    }
    console.log('👋 Goodbye!');
  }
}

// Start the simulator
const simulator = new FestivleSimulator();
simulator.start().catch(error => {
  console.error('Failed to start simulator:', error);
  process.exit(1);
});
