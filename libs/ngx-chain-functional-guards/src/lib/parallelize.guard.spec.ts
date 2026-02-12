import { EnvironmentInjector, runInInjectionContext } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  GuardResult,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router'

import { Observable, delay, firstValueFrom, map, of } from 'rxjs'

import { createTestInjector } from '../test-setup'
import { parallelizeActivationGuards } from './parallelize.guard'

describe('parallelizeActivationGuards', () => {
  const route: ActivatedRouteSnapshot = {} as ActivatedRouteSnapshot
  const state: RouterStateSnapshot = {} as RouterStateSnapshot
  let injector: EnvironmentInjector

  beforeEach(() => {
    injector = createTestInjector()
  })

  afterEach(() => {
    injector.destroy()
  })

  const delayPromise = (delay: number): Promise<boolean> =>
    new Promise(resolve => setTimeout(() => resolve(true), delay))

  const runGuardAsync = (...guards: Array<CanActivateFn>) => {
    const result = runInInjectionContext(injector, () =>
      parallelizeActivationGuards(...guards)(route, state)
    )

    return result as Observable<GuardResult>
  }

  it('should return true without any guards', async () => {
    const result = await firstValueFrom(runGuardAsync())

    expect(result).toEqual(true)
  })

  it('should work with synchronous guards', async () => {
    const guard = () => true

    const result = await firstValueFrom(runGuardAsync(guard))

    expect(result).toEqual(true)
  })

  it('should work with Promise guards', async () => {
    const guard = () => delayPromise(100)

    const result = await firstValueFrom(runGuardAsync(guard))

    expect(result).toEqual(true)
  })

  it('should work with Observable guards', async () => {
    const guard = () =>
      of(true).pipe(
        delay(100),
        map(() => true)
      )

    const result = await firstValueFrom(runGuardAsync(guard))

    expect(result).toEqual(true)
  })

  it('should finish when all guards have finished', async () => {
    const results = new Array<boolean>()

    const delays = [100, 50, 200]

    const guards = delays.map(delay => async () => {
      await delayPromise(delay)

      results.push(true)

      return true
    })

    await firstValueFrom(runGuardAsync(...guards))

    expect(results.length).toEqual(guards.length)
  })

  it('should take less time than all guards together', async () => {
    const results = new Array<boolean>()

    const delays = [100, 50, 200]

    const guards = delays.map(delay => async () => {
      await delayPromise(delay)

      results.push(true)

      return true
    })

    const startTime = performance.now()

    const result = await firstValueFrom(runGuardAsync(...guards))

    const duration = performance.now() - startTime

    expect(result).toEqual(true)
    expect(results.length).toEqual(guards.length)
    expect(duration).toBeLessThan(delays.reduce((total, delay) => total + delay))
  })

  it('should finish early if any guard returns a non-true result', async () => {
    const results = new Array<boolean>()

    const earlyDelay = 100
    const lateDelay = 200

    const guards: Array<CanActivateFn> = [
      async () => {
        await delayPromise(earlyDelay)

        results.push(false)

        return false
      },

      async () => {
        await delayPromise(lateDelay)

        results.push(true)

        return true
      },

      async () => {
        await delayPromise(lateDelay)

        results.push(true)

        return false as GuardResult
      }
    ]

    const startTime = performance.now()

    const result = await firstValueFrom(runGuardAsync(...guards))

    const duration = performance.now() - startTime

    expect(result).toEqual(false)
    expect(results.length).toBeLessThan(guards.length)
    expect(duration).toBeLessThan(lateDelay)
  })

  it('should wait for guards that are dependent on others', async () => {
    const results = new Array<boolean>()

    const guards: Array<CanActivateFn> = [
      async () => {
        await delayPromise(100)

        results.push(false)

        return true
      },

      // This guard will only complete after there are two other results.
      async () =>
        new Promise<GuardResult>(resolve => {
          const interval = setInterval(() => {
            if (results.length >= 2) {
              clearInterval(interval)
              results.push(true)
              resolve(true)
            }
          }, 100)
        }),

      async () => {
        await delayPromise(100)

        results.push(true)

        return true
      }
    ]

    // At 150ms, only 2 guards should have completed
    const earlyCheck = delayPromise(150).then(() => {
      expect(results.length).toBeLessThan(guards.length)
    })

    const guardResult = firstValueFrom(runGuardAsync(...guards))

    await earlyCheck

    await guardResult

    expect(results.length).toEqual(guards.length)
  })
})
