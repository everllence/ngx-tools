import { EnvironmentInjector, runInInjectionContext } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  CanDeactivateFn,
  GuardResult,
  RouterStateSnapshot
} from '@angular/router'

import { Observable, firstValueFrom, of, tap } from 'rxjs'

import { createTestInjector } from '../test-setup'
import { chainActivationGuards, chainDeactivationGuards } from './chain.guard'

describe('Chained Functional Guards', () => {
  const route = {} as ActivatedRouteSnapshot
  const state = {} as RouterStateSnapshot
  const nextState = {} as RouterStateSnapshot
  let injector: EnvironmentInjector

  let guardMap: Record<string, { start: number; end: number }>
  let offsetCounter: number

  function createActivationGuard(returnValue: boolean, guardName: string): CanActivateFn {
    return () => {
      guardMap[guardName] = { start: offsetCounter++, end: 0 }
      return of(returnValue).pipe(
        tap(() => (guardMap[guardName] = { ...guardMap[guardName], end: offsetCounter++ }))
      )
    }
  }

  function createDeactivationGuard(
    returnValue: boolean,
    guardName: string
  ): CanDeactivateFn<never> {
    return () => {
      guardMap[guardName] = { start: offsetCounter++, end: 0 }
      return of(returnValue).pipe(
        tap(() => (guardMap[guardName] = { ...guardMap[guardName], end: offsetCounter++ }))
      )
    }
  }

  const runActivationGuard = (guard: CanActivateFn) =>
    runInInjectionContext(injector, () => guard(route, state)) as Observable<GuardResult>

  const runDeactivationGuard = (guard: CanDeactivateFn<never>) =>
    runInInjectionContext(injector, () =>
      guard({} as never, route, state, nextState)
    ) as Observable<GuardResult>

  beforeEach(() => {
    injector = createTestInjector()
    guardMap = {}
    offsetCounter = 0
  })

  afterEach(() => {
    injector.destroy()
  })

  describe('Legacy (array) signature', () => {
    describe('Chain Activation', () => {
      it('should call activation guards in a given sequence', async () => {
        const guard1 = createActivationGuard(true, 'guard1')
        const guard2 = createActivationGuard(true, 'guard2')
        const guard3 = createActivationGuard(true, 'guard3')
        const guard4 = createActivationGuard(true, 'guard4')

        const chained = chainActivationGuards([guard3, guard2, guard1, guard4])
        const result = await firstValueFrom(runActivationGuard(chained))

        expect(result).toEqual(true)
        expect(guardMap).toEqual({
          guard3: { start: 0, end: 1 },
          guard2: { start: 2, end: 3 },
          guard1: { start: 4, end: 5 },
          guard4: { start: 6, end: 7 }
        })
      })

      it('should short circuit on false', async () => {
        const guardFalsy = createActivationGuard(false, 'guardFalsy')
        const guardTruthy = createActivationGuard(true, 'guardTruthy')

        const chained = chainActivationGuards([guardFalsy, guardTruthy])
        const result = await firstValueFrom(runActivationGuard(chained))

        expect(result).toEqual(false)
        expect(guardMap).toEqual({ guardFalsy: { start: 0, end: 1 } })
      })
    })

    describe('Chain Deactivation', () => {
      it('should call deactivation guards in a given sequence', async () => {
        const guard1 = createDeactivationGuard(true, 'guard1')
        const guard2 = createDeactivationGuard(true, 'guard2')
        const guard3 = createDeactivationGuard(true, 'guard3')
        const guard4 = createDeactivationGuard(true, 'guard4')

        const chained = chainDeactivationGuards([guard3, guard2, guard1, guard4])
        const result = await firstValueFrom(runDeactivationGuard(chained))

        expect(result).toEqual(true)
        expect(guardMap).toEqual({
          guard3: { start: 0, end: 1 },
          guard2: { start: 2, end: 3 },
          guard1: { start: 4, end: 5 },
          guard4: { start: 6, end: 7 }
        })
      })

      it('should short circuit on false', async () => {
        const guardFalsy = createDeactivationGuard(false, 'guardFalsy')
        const guardTruthy = createDeactivationGuard(true, 'guardTruthy')

        const chained = chainDeactivationGuards([guardFalsy, guardTruthy])
        const result = await firstValueFrom(runDeactivationGuard(chained))

        expect(result).toEqual(false)
        expect(guardMap).toEqual({ guardFalsy: { start: 0, end: 1 } })
      })
    })
  })

  describe('Rest parameter signature', () => {
    describe('Chain Activation', () => {
      it('should call activation guards in a given sequence', async () => {
        const guard1 = createActivationGuard(true, 'guard1')
        const guard2 = createActivationGuard(true, 'guard2')
        const guard3 = createActivationGuard(true, 'guard3')
        const guard4 = createActivationGuard(true, 'guard4')

        const chained = chainActivationGuards(guard3, guard2, guard1, guard4)
        const result = await firstValueFrom(runActivationGuard(chained))

        expect(result).toEqual(true)
        expect(guardMap).toEqual({
          guard3: { start: 0, end: 1 },
          guard2: { start: 2, end: 3 },
          guard1: { start: 4, end: 5 },
          guard4: { start: 6, end: 7 }
        })
      })

      it('should short circuit on false', async () => {
        const guardFalsy = createActivationGuard(false, 'guardFalsy')
        const guardTruthy = createActivationGuard(true, 'guardTruthy')

        const chained = chainActivationGuards(guardFalsy, guardTruthy)
        const result = await firstValueFrom(runActivationGuard(chained))

        expect(result).toEqual(false)
        expect(guardMap).toEqual({ guardFalsy: { start: 0, end: 1 } })
      })
    })

    describe('Chain Deactivation', () => {
      it('should call deactivation guards in a given sequence', async () => {
        const guard1 = createDeactivationGuard(true, 'guard1')
        const guard2 = createDeactivationGuard(true, 'guard2')
        const guard3 = createDeactivationGuard(true, 'guard3')
        const guard4 = createDeactivationGuard(true, 'guard4')

        const chained = chainDeactivationGuards(guard3, guard2, guard1, guard4)
        const result = await firstValueFrom(runDeactivationGuard(chained))

        expect(result).toEqual(true)
        expect(guardMap).toEqual({
          guard3: { start: 0, end: 1 },
          guard2: { start: 2, end: 3 },
          guard1: { start: 4, end: 5 },
          guard4: { start: 6, end: 7 }
        })
      })

      it('should short circuit on false', async () => {
        const guardFalsy = createDeactivationGuard(false, 'guardFalsy')
        const guardTruthy = createDeactivationGuard(true, 'guardTruthy')

        const chained = chainDeactivationGuards(guardFalsy, guardTruthy)
        const result = await firstValueFrom(runDeactivationGuard(chained))

        expect(result).toEqual(false)
        expect(guardMap).toEqual({ guardFalsy: { start: 0, end: 1 } })
      })
    })
  })
})
