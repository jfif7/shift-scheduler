export interface GeneticStats {
  maximum: number
  minimum: number
  mean: number
  stdev: number
}

export interface GeneticConfig {
  size?: number
  crossover?: number
  mutation?: number
  iterations?: number
  fittestAlwaysSurvives?: boolean
  maxResults?: number
  skip?: number
}

// Optimization functions
export const Optimize = {
  Maximize: (a: number, b: number) => a >= b,
  Minimize: (a: number, b: number) => a < b,
}

// Selection functions for single parent
const Select1 = {
  Tournament2<T>(
    optimize: (a: number, b: number) => boolean,
    pop: Array<{ fitness: number; entity: T }>
  ): T {
    const n = pop.length
    const a = pop[Math.floor(Math.random() * n)]
    const b = pop[Math.floor(Math.random() * n)]
    return optimize(a.fitness, b.fitness) ? a.entity : b.entity
  },

  Tournament3<T>(
    optimize: (a: number, b: number) => boolean,
    pop: Array<{ fitness: number; entity: T }>
  ): T {
    const n = pop.length
    const a = pop[Math.floor(Math.random() * n)]
    const b = pop[Math.floor(Math.random() * n)]
    const c = pop[Math.floor(Math.random() * n)]
    let best = optimize(a.fitness, b.fitness) ? a : b
    best = optimize(best.fitness, c.fitness) ? best : c
    return best.entity
  },

  Fittest<T>(pop: Array<{ fitness: number; entity: T }>): T {
    return pop[0].entity
  },

  Random<T>(pop: Array<{ fitness: number; entity: T }>): T {
    return pop[Math.floor(Math.random() * pop.length)].entity
  },
}

// Selection functions for two parents
const Select2 = {
  Tournament2<T>(
    optimize: (a: number, b: number) => boolean,
    pop: Array<{ fitness: number; entity: T }>
  ): [T, T] {
    return [
      Select1.Tournament2(optimize, pop),
      Select1.Tournament2(optimize, pop),
    ]
  },

  Random<T>(pop: Array<{ fitness: number; entity: T }>): [T, T] {
    return [Select1.Random(pop), Select1.Random(pop)]
  },

  FittestRandom<T>(pop: Array<{ fitness: number; entity: T }>): [T, T] {
    return [Select1.Fittest(pop), Select1.Random(pop)]
  },
}

// Deep clone utility
function clone<T>(obj: T): T {
  if (obj == null || typeof obj !== "object") return obj
  return JSON.parse(JSON.stringify(obj))
}

export interface GeneticInstance<T> {
  // Required functions to be set by user
  fitness: ((entity: T) => number) | null
  seed: (() => T) | null
  mutate: ((entity: T) => T) | null
  crossover: ((mother: T, father: T) => [T, T]) | null

  // Optional functions
  select1: ((pop: Array<{ fitness: number; entity: T }>) => T) | null
  select2: ((pop: Array<{ fitness: number; entity: T }>) => [T, T]) | null
  optimize: ((a: number, b: number) => boolean) | null
  generation:
    | ((
        pop: Array<{ fitness: number; entity: T }>,
        generation: number,
        stats: GeneticStats
      ) => boolean)
    | null
  notification:
    | ((
        pop: Array<{ fitness: number; entity: T }>,
        generation: number,
        stats: GeneticStats,
        isFinished: boolean
      ) => void)
    | null

  // Configuration
  configuration: {
    size: number
    crossover: number
    mutation: number
    iterations: number
    fittestAlwaysSurvives: boolean
    maxResults: number
    skip: number
  }

  // Internal state
  userData: Record<string, unknown>
  internalGenState: Record<string, unknown>
  entities: T[]

  // Methods
  evolve(config: GeneticConfig): Promise<T>
}

class GeneticAlgorithm<T> implements GeneticInstance<T> {
  fitness: ((entity: T) => number) | null = null
  seed: (() => T) | null = null
  mutate: ((entity: T) => T) | null = null
  crossover: ((mother: T, father: T) => [T, T]) | null = null
  select1: ((pop: Array<{ fitness: number; entity: T }>) => T) | null = null
  select2: ((pop: Array<{ fitness: number; entity: T }>) => [T, T]) | null =
    null
  optimize: ((a: number, b: number) => boolean) | null = null
  generation:
    | ((
        pop: Array<{ fitness: number; entity: T }>,
        generation: number,
        stats: GeneticStats
      ) => boolean)
    | null = null
  notification:
    | ((
        pop: Array<{ fitness: number; entity: T }>,
        generation: number,
        stats: GeneticStats,
        isFinished: boolean
      ) => void)
    | null = null

  configuration = {
    size: 250,
    crossover: 0.9,
    mutation: 0.2,
    iterations: 100,
    fittestAlwaysSurvives: true,
    maxResults: 100,
    skip: 0,
  }

  userData: Record<string, unknown> = {}
  internalGenState: Record<string, unknown> = {}
  entities: T[] = []

  private mutateOrNot(entity: T): T {
    // applies mutation based on mutation probability
    return Math.random() <= this.configuration.mutation && this.mutate
      ? this.mutate(clone(entity))
      : entity
  }

  private start(): T {
    if (!this.fitness || !this.seed) {
      throw new Error("fitness and seed functions must be defined")
    }

    // Set default selection functions if not provided
    if (!this.select1) {
      this.select1 = (pop) => Select1.Tournament2(this.optimize!, pop)
    }
    if (!this.select2) {
      this.select2 = (pop) => Select2.Tournament2(this.optimize!, pop)
    }
    if (!this.optimize) this.optimize = Optimize.Minimize

    // seed the population
    for (let i = 0; i < this.configuration.size; ++i) {
      this.entities.push(clone(this.seed()))
    }

    for (let i = 0; i < this.configuration.iterations; ++i) {
      // reset for each generation
      this.internalGenState = {}

      // score and sort
      const pop = this.entities
        .map((entity) => ({ fitness: this.fitness!(entity), entity }))
        .sort((a, b) => (this.optimize!(a.fitness, b.fitness) ? -1 : 1))

      // generation notification
      const mean = pop.reduce((a, b) => a + b.fitness, 0) / pop.length
      const stdev = Math.sqrt(
        pop
          .map((a) => (a.fitness - mean) * (a.fitness - mean))
          .reduce((a, b) => a + b, 0) / pop.length
      )

      const stats: GeneticStats = {
        maximum: pop[0].fitness,
        minimum: pop[pop.length - 1].fitness,
        mean,
        stdev,
      }

      const r = this.generation
        ? this.generation(pop.slice(0, this.configuration.maxResults), i, stats)
        : true
      const isFinished =
        (typeof r !== "undefined" && !r) ||
        i === this.configuration.iterations - 1

      if (
        this.notification &&
        (isFinished ||
          this.configuration.skip === 0 ||
          i % this.configuration.skip === 0)
      ) {
        this.notification(
          pop.slice(0, this.configuration.maxResults),
          i,
          stats,
          isFinished
        )
      }

      if (isFinished) {
        return pop[0].entity
      }

      // crossover and mutate
      const newPop: T[] = []

      if (this.configuration.fittestAlwaysSurvives) {
        // lets the best solution fall through
        newPop.push(pop[0].entity)
      }

      while (newPop.length < this.configuration.size) {
        if (
          this.crossover && // if there is a crossover function
          Math.random() <= this.configuration.crossover && // base crossover on specified probability
          newPop.length + 1 < this.configuration.size // keeps us from going 1 over the max population size
        ) {
          const parents = this.select2!(pop)
          const children = this.crossover(
            clone(parents[0]),
            clone(parents[1])
          ).map((child) => this.mutateOrNot(child))
          newPop.push(children[0], children[1])
        } else {
          newPop.push(this.mutateOrNot(this.select1!(pop)))
        }
      }

      this.entities = newPop
    }

    // Return the best entity from the final population
    const finalPop = this.entities
      .map((entity) => ({ fitness: this.fitness!(entity), entity }))
      .sort((a, b) => (this.optimize!(a.fitness, b.fitness) ? -1 : 1))

    return finalPop[0].entity
  }

  async evolve(config: GeneticConfig = {}): Promise<T> {
    // Apply configuration
    Object.assign(this.configuration, config)

    return new Promise((resolve, reject) => {
      try {
        const result = this.start()
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
  }
}

// Main API
const genetic = {
  create<T>(): GeneticInstance<T> {
    return new GeneticAlgorithm<T>()
  },
  Optimize,
  Select1,
  Select2,
  Clone: clone,
}

export default genetic
