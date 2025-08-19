# 🎪 Festivle - The Ultimate Festival Simulator

A highly detailed, AI-powered, hyper-realistic festival simulator built in TypeScript that simulates full-scale festival environments with dynamic crowd behavior, music scheduling, vendor interactions, artist performances, weather systems, logistical challenges, and real-time decision-making.

## 🌟 Features

### Core Simulation Systems
- **Weather Engine**: Dynamic weather simulation with realistic patterns, forecasts, and impact assessment
- **Crowd Engine**: Intelligent attendee behavior, movement patterns, satisfaction tracking, and crowd density management
- **Logistics Engine**: Venue operations, equipment management, and facility utilization
- **Financial Engine**: Budget tracking, revenue streams, cost management, and financial projections
- **Safety Engine**: Incident management, emergency protocols, and safety compliance
- **Performance Engine**: Artist scheduling, performance management, and audience satisfaction
- **Vendor Engine**: Vendor operations, queue management, and revenue tracking
- **Staff Engine**: Personnel management, availability tracking, and performance monitoring
- **Power Engine**: Power grid management and equipment power requirements
- **Security Engine**: Security personnel, incident monitoring, and crowd control
- **AI Engine**: Automated decision-making and situation analysis

### Advanced Features
- **Real-time Metrics**: Live monitoring of attendance, financials, safety, and operational data
- **Dynamic Weather**: Realistic weather patterns affecting all aspects of festival operations
- **Crowd Intelligence**: Sophisticated crowd behavior modeling with individual attendee characteristics
- **Incident Management**: Comprehensive incident tracking, response protocols, and resolution
- **Budget Management**: Multi-category budget tracking with alerts and cost-cutting measures
- **Equipment Monitoring**: Real-time status tracking and predictive maintenance alerts
- **Vendor Operations**: Queue management, satisfaction tracking, and revenue optimization
- **Staff Coordination**: Availability management, performance tracking, and emergency response

### Simulation Capabilities
- **Multi-day Events**: Support for 3-day festival simulations
- **Scalable Complexity**: Configurable difficulty levels from Easy to Realistic
- **Real-time Control**: Start, pause, resume, and stop simulation with adjustable time scales
- **Event-driven Architecture**: Reactive systems that respond to changing conditions
- **Comprehensive Logging**: Detailed event tracking and incident reporting
- **Performance Analytics**: Real-time metrics and historical data analysis

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/festivle-ts-simulator.git
   cd festivle-ts-simulator
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build the project**
   ```bash
   pnpm build
   ```

4. **Start the simulator**
   ```bash
   pnpm start
   ```

### Development Mode

For development with auto-reload:
```bash
pnpm dev
```

## 🎮 Usage

### Starting the Simulation

Once the simulator starts, you'll see a welcome message and available commands:

```
🎪 Welcome to Festivle - The Ultimate Festival Simulator! 🎪

🎵 Initializing Festival Environment...

✅ Festival "Electric Dreams Festival 2024" initialized successfully!
📍 Venue: Neon Valley Complex
👥 Capacity: 15,000 attendees
🎭 Genre: EDM
🌍 Theme: Futuristic
📅 Duration: [Current Date] - [Current Date + 2 days]

🎮 Starting Festival Simulation...

Available commands:
  start     - Start the simulation
  pause     - Pause the simulation
  resume    - Resume the simulation
  stop      - Stop the simulation
  status    - Show current status
  metrics   - Show current metrics
  help      - Show this help
  quit      - Exit the simulator
```

### Available Commands

- **`start`** - Start the simulation
- **`pause`** - Pause the simulation
- **`resume`** - Resume the simulation
- **`stop`** - Stop the simulation
- **`status`** - Show current festival status
- **`metrics`** - Display current metrics and analytics
- **`help`** - Show available commands
- **`quit`** - Exit the simulator

### Real-time Monitoring

The simulator provides real-time updates every 15 minutes:

```
⏰ 14:00:00 - Festival Status: Active
👥 Attendees: 12,450
💰 Revenue: $45,230
🌤️ Weather: 24°C, 0mm rain

🌤️ Weather Update: 25°C, 0mm rain
🚨 Incident: Medical - Attendee requiring medical attention
```

## 🏗️ Architecture

### Core Components

```
src/
├── core/
│   ├── SimulationEngine.ts      # Main simulation orchestrator
│   └── systems/                 # Individual system engines
│       ├── WeatherEngine.ts     # Weather simulation
│       ├── CrowdEngine.ts       # Crowd behavior
│       ├── LogisticsEngine.ts   # Venue operations
│       ├── FinancialEngine.ts   # Budget management
│       ├── SafetyEngine.ts      # Incident management
│       ├── PerformanceEngine.ts # Artist performances
│       ├── VendorEngine.ts      # Vendor operations
│       ├── StaffEngine.ts       # Personnel management
│       ├── PowerEngine.ts       # Power management
│       ├── SecurityEngine.ts    # Security operations
│       └── AIEngine.ts          # AI decision making
├── factories/
│   ├── FestivalFactory.ts       # Festival configuration
│   └── SettingsFactory.ts       # Simulation settings
├── types/
│   ├── index.ts                 # Core type definitions
│   └── additional.ts            # Extended types
└── index.ts                     # Main entry point
```

### System Interactions

The simulation engine coordinates all systems through an event-driven architecture:

1. **Weather Engine** processes environmental conditions
2. **Crowd Engine** responds to weather and updates behavior
3. **Logistics Engine** adjusts operations based on crowd and weather
4. **Safety Engine** monitors for incidents and triggers responses
5. **Financial Engine** tracks costs and revenue
6. **AI Engine** analyzes situations and makes decisions
7. **All systems** emit events that other systems can respond to

## ⚙️ Configuration

### Simulation Settings

The simulator supports multiple difficulty levels and configurations:

- **Easy**: Faster time scale, simplified AI, reduced complexity
- **Normal**: Balanced settings for most users
- **Hard**: Slower time scale, advanced AI, high complexity
- **Expert**: Maximum realism and complexity
- **Realistic**: Professional-grade simulation settings

### Customization

You can customize various aspects of the simulation:

- **Time Scale**: Adjust simulation speed (0.1x to 10x)
- **AI Complexity**: Control decision-making sophistication
- **Realism Level**: Set simulation accuracy
- **Feature Toggles**: Enable/disable specific systems
- **Plugin Support**: Extend functionality with plugins

## 📊 Metrics & Analytics

### Real-time Data

The simulator provides comprehensive real-time metrics:

- **Attendance**: Current attendees, peak counts, zone densities
- **Financial**: Revenue, costs, profit, budget status
- **Safety**: Incident counts, response times, risk levels
- **Operational**: Efficiency, staff utilization, equipment status
- **Weather**: Current conditions, forecasts, impact assessment
- **Performance**: Artist satisfaction, audience engagement

### Historical Data

All simulation data is logged and can be analyzed:

- Incident reports with resolution times
- Financial performance over time
- Crowd behavior patterns
- Weather impact assessments
- Equipment failure logs
- Staff performance metrics

## 🔧 Development

### Adding New Features

1. **Create new system engine** in `src/core/systems/`
2. **Extend type definitions** in `src/types/`
3. **Integrate with SimulationEngine** in `src/core/SimulationEngine.ts`
4. **Add factory methods** if needed
5. **Update documentation**

### Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test --coverage

# Run specific test file
pnpm test -- CrowdEngine.test.ts
```

### Code Quality

```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Type checking
pnpm build
```

## 🌍 Use Cases

### Festival Organizers
- Test different venue layouts and configurations
- Optimize staffing and resource allocation
- Plan for weather contingencies
- Analyze financial projections
- Test emergency response protocols

### Event Management Students
- Learn about festival operations
- Understand crowd dynamics
- Study incident management
- Practice budget planning
- Experience real-time decision making

### Researchers
- Study crowd behavior patterns
- Analyze weather impact on events
- Research incident response effectiveness
- Model financial risk scenarios
- Test AI decision-making systems

### Game Developers
- Study simulation architecture
- Learn event-driven programming
- Understand complex system interactions
- Explore AI integration patterns
- Research realistic game mechanics

## 🚧 Roadmap

### Phase 1 (Current)
- ✅ Core simulation engine
- ✅ Basic system engines
- ✅ CLI interface
- ✅ Real-time metrics

### Phase 2 (Next)
- 🔄 Web-based dashboard
- 🔄 Advanced AI decision making
- 🔄 Multi-venue support
- 🔄 Plugin system

### Phase 3 (Future)
- 📋 Virtual reality integration
- 📋 Multi-player simulation
- 📋 Advanced analytics
- 📋 Machine learning integration

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Areas for Contribution
- New system engines
- Enhanced AI algorithms
- Additional venue types
- More realistic crowd behaviors
- Advanced weather modeling
- Performance optimizations
- Documentation improvements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with TypeScript and Node.js
- Inspired by real-world festival management challenges
- Designed for educational and research purposes
- Community-driven development and feedback

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/festivle-ts-simulator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/festivle-ts-simulator/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/festivle-ts-simulator/wiki)

---

**🎉 Welcome to the future of festival simulation! 🎉**

Experience the complexity, excitement, and challenges of managing a real-world festival in this immersive, AI-powered simulation environment.
