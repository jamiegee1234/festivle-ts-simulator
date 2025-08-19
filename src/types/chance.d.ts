declare module 'chance' {
  export default class Chance {
    constructor(seed?: string | number);
    guid(): string;
    floating(options?: { min?: number; max?: number }): number;
    integer(options?: { min?: number; max?: number }): number;
    bool(options?: { likelihood?: number }): boolean;
    pickone<T>(array: T[]): T;
    pickset<T>(array: T[], count: number): T[];
    city(): string;
    weighted<T>(items: T[], weights: number[]): T;
  }
}
