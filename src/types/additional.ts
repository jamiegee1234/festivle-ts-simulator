// Additional type definitions for the festival simulator

export interface VenueRestrictions {
  noiseCurfew: Date;
  maxDbLevel: number;
  alcoholLicense: boolean;
  alcoholHours: any;
  ageRestriction: number;
  capacityLimit: number;
  fireCodeCompliance: boolean;
  accessibilityRequirements: string[];
}

export interface Permit {
  id: string;
  type: string;
  issuer: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'Active' | 'Expired' | 'Pending' | 'Revoked';
  requirements: string[];
  fees: number;
}

export interface VenueLayout {
  zones: Zone[];
  pathways: Pathway[];
  barriers: any[];
  emergencyExits: EmergencyExit[];
  accessibilityFeatures: AccessibilityFeature[];
}

export interface Zone {
  id: string;
  name: string;
  type: 'Stage' | 'Vendor' | 'Rest' | 'VIP' | 'Camping' | 'Parking';
  capacity: number;
  currentOccupancy: number;
  boundaries: Boundary[];
  facilities: string[];
}

export interface Pathway {
  id: string;
  startZone: string;
  endZone: string;
  width: number;
  capacity: number;
  currentTraffic: number;
  bottlenecks: Bottleneck[];
}

export interface Boundary {
  type: 'Fence' | 'Wall' | 'Natural' | 'Barrier';
  coordinates: Location[];
  height: number;
  material: string;
}

export interface Bottleneck {
  location: Location;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  cause: string;
  solutions: string[];
}

export interface EmergencyExit {
  id: string;
  location: Location;
  capacity: number;
  status: 'Clear' | 'Blocked' | 'Congested';
  signage: boolean;
  lighting: boolean;
}

export interface AccessibilityFeature {
  type: 'Ramp' | 'Elevator' | 'WidePath' | 'Seating' | 'Restroom';
  location: Location;
  status: 'Available' | 'Maintenance' | 'OutOfOrder';
  compliance: boolean;
}

export interface StageEquipment {
  audio: AudioEquipment;
  lighting: LightingEquipment;
  video: VideoEquipment;
  power: PowerEquipment;
  special: SpecialEquipment;
}

export interface AudioEquipment {
  paSystem: boolean;
  monitors: boolean;
  mixingConsole: boolean;
  microphones: number;
  instruments: string[];
  status: 'Operational' | 'Maintenance' | 'Faulty';
}

export interface LightingEquipment {
  mainLights: boolean;
  spotlights: boolean;
  movingLights: boolean;
  fogMachine: boolean;
  lasers: boolean;
  status: 'Operational' | 'Maintenance' | 'Faulty';
}

export interface VideoEquipment {
  screens: boolean;
  projectors: boolean;
  cameras: boolean;
  streaming: boolean;
  status: 'Operational' | 'Maintenance' | 'Faulty';
}

export interface PowerEquipment {
  generators: boolean;
  ups: boolean;
  distribution: boolean;
  backup: boolean;
  status: 'Operational' | 'Maintenance' | 'Faulty';
}

export interface SpecialEquipment {
  pyro: boolean;
  co2: boolean;
  confetti: boolean;
  bubbles: boolean;
  status: 'Operational' | 'Maintenance' | 'Faulty';
}

export interface StageSchedule {
  performances: Performance[];
  changeovers: any[];
  maintenance: MaintenanceWindow[];
  setup: SetupWindow[];
}

export interface MaintenanceWindow {
  id: string;
  startTime: Date;
  endTime: Date;
  type: 'Routine' | 'Emergency' | 'Upgrade';
  description: string;
  staff: string[];
}

export interface SetupWindow {
  id: string;
  startTime: Date;
  endTime: Date;
  artist: string;
  requirements: string[];
  status: 'Scheduled' | 'InProgress' | 'Completed';
}

export interface SoundcheckWindow {
  startTime: Date;
  endTime: Date;
  duration: number;
  critical: boolean;
  completed: boolean;
}

export interface LoadInWindow {
  startTime: Date;
  endTime: Date;
  duration: number;
  dock: string;
  equipment: string[];
  completed: boolean;
}

export interface LoadOutWindow {
  startTime: Date;
  endTime: Date;
  duration: number;
  dock: string;
  equipment: string[];
  completed: boolean;
}

export interface PowerRequirement {
  total: number;
  phases: number;
  voltage: number;
  critical: boolean;
  backup: boolean;
}

export interface LightingRequirement {
  total: number;
  dimmers: number;
  movingLights: number;
  specialEffects: boolean;
  programming: boolean;
}

export interface SpecialEffect {
  type: string;
  quantity: number;
  safety: boolean;
  permits: boolean;
  staff: string[];
}

export interface ArtistContract {
  id: string;
  fee: number;
  deposit: number;
  cancellationPolicy: string;
  radiusClause: number;
  forceMajeure: boolean;
  insurance: boolean;
  penalties: Penalty[];
}

export interface Penalty {
  type: string;
  amount: number;
  conditions: string[];
  waived: boolean;
}

export interface HospitalityRider {
  id: string;
  food: FoodRequirement[];
  beverages: BeverageRequirement[];
  accommodation: AccommodationRequirement;
  transportation: TransportationRequirement;
  special: SpecialRequirement[];
}

export interface FoodRequirement {
  type: string;
  quantity: number;
  dietary: string[];
  timing: string;
  critical: boolean;
}

export interface BeverageRequirement {
  type: string;
  quantity: number;
  temperature: string;
  timing: string;
  critical: boolean;
}

export interface AccommodationRequirement {
  type: string;
  rooms: number;
  amenities: string[];
  location: string;
  critical: boolean;
}

export interface TransportationRequirement {
  type: string;
  capacity: number;
  timing: string;
  special: string[];
  critical: boolean;
}

export interface SpecialRequirement {
  type: string;
  description: string;
  critical: boolean;
  cost: number;
}

export interface Merchandise {
  id: string;
  items: MerchItem[];
  cut: number;
  revenue: number;
  inventory: number;
}

export interface MerchItem {
  name: string;
  price: number;
  cost: number;
  quantity: number;
  sold: number;
}

export type ArtistStatus = 'Confirmed' | 'Pending' | 'Cancelled' | 'OnSite' | 'Performing';

export interface Demographics {
  age: number;
  gender: string;
  location: string;
  income: string;
  interests: string[];
}

export interface AttendeePreferences {
  music: string[];
  activities: string[];
  food: string[];
  beverages: string[];
  spending: number;
}

export interface MovementPattern {
  speed: number;
  direction: number;
  destination: Location;
  obstacles: string[];
  congestion: number;
}

export interface SocialInteraction {
  type: string;
  participants: string[];
  duration: number;
  satisfaction: number;
}

export type AttendeeStatus = 'Active' | 'Inactive' | 'Leaving' | 'Arriving' | 'Distressed';

export interface SpendingPattern {
  food: number;
  beverages: number;
  merchandise: number;
  activities: number;
  total: number;
}

export interface WeatherForecast {
  timestamp: Date;
  condition: any;
  confidence: number;
  impact: any;
}

export interface WeatherAlert {
  id: string;
  type: string;
  severity: string;
  description: string;
  startTime: Date;
  endTime: Date;
  actions: string[];
}

export interface Skill {
  name: string;
  level: number;
  certified: boolean;
  experience: number;
}

export interface Availability {
  startTime: Date;
  endTime: Date;
  breaks: any[];
  overtime: boolean;
  emergency: boolean;
}

export interface PerformanceRating {
  score: number;
  feedback: string[];
  improvements: string[];
  recognition: string[];
}

export interface Break {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  type: 'Scheduled' | 'Emergency' | 'Maintenance';
}

export interface SpecialEvent {
  id: string;
  name: string;
  type: string;
  startTime: Date;
  endTime: Date;
  location: string;
  capacity: number;
  currentAttendance: number;
}

export interface OperationalMetrics {
  efficiency: number;
  responseTime: number;
  incidents: number;
  staffUtilization: number;
  equipmentUptime: number;
}

export interface SafetyMetrics {
  incidents: number;
  responseTime: number;
  compliance: number;
  training: number;
  riskLevel: string;
}

export interface SatisfactionMetrics {
  overall: number;
  byCategory: Record<string, number>;
  feedback: string[];
  improvements: string[];
}

export interface EnvironmentalMetrics {
  carbonFootprint: number;
  waste: number;
  recycling: number;
  energy: number;
  water: number;
}

export interface MaintenanceStatus {
  status: 'Operational' | 'Maintenance' | 'Faulty' | 'OutOfOrder';
  lastCheck: Date;
  nextCheck: Date;
  issues: string[];
}
