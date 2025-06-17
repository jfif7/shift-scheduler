declare module "simulated-annealing" {
  interface SimulatedAnnealingOptions<T> {
    initialState: T
    tempMax: number
    tempMin: number
    newState: (currentState: T) => T
    getTemp: (previousTemp: number) => number
    getEnergy: (state: T) => number
  }

  function simulatedAnnealing<T>(options: SimulatedAnnealingOptions<T>): T
  export = simulatedAnnealing
}
