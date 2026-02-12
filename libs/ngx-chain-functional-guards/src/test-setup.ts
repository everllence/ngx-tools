import { EnvironmentInjector, createEnvironmentInjector } from '@angular/core'

/**
 * Creates a minimal EnvironmentInjector for testing without any DOM or browser dependencies.
 * This is sufficient for testing guards that only use Angular DI and RxJS.
 */
export function createTestInjector(): EnvironmentInjector {
  return createEnvironmentInjector([], null as unknown as EnvironmentInjector)
}
