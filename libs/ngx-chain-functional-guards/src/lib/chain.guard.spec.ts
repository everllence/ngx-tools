import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'

import { of, tap } from 'rxjs'

import { chainActivationGuards, chainDeactivationGuards } from './chain.guard'

@Component({ selector: 'lib-dummy-component', template: `` })
class DummyComponent {}
describe('Chained Functional Guards', () => {
  describe('Chained Functional Guards Legacy', () => {
    let guardMap: Record<string, { start: number; end: number }> = {}
    let router: Router
    let offsetCounter = 0

    function createGuard<T extends CanActivateFn | CanDeactivateFn<never>>(
      returnValue: boolean,
      guardName: string
    ): T {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return ((..._args: never[]) => {
        guardMap[guardName] = { start: offsetCounter++, end: 0 }

        return of(returnValue).pipe(
          tap(
            () =>
              (guardMap[guardName] = {
                ...guardMap[guardName],
                end: offsetCounter++
              })
          )
        )
      }) as T
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [],
        teardown: { destroyAfterEach: true }
      })
      router = TestBed.inject(Router)
      guardMap = {}
      offsetCounter = 0
    })

    describe('Chain Activation', () => {
      const guard1Truthy: CanActivateFn = createGuard<CanActivateFn>(true, 'guard1Truthy')
      const guard2Truthy: CanActivateFn = createGuard<CanActivateFn>(true, 'guard2Truthy')
      const guard2Falsy: CanActivateFn = createGuard<CanActivateFn>(false, 'guard2Falsy')
      const guard3Truthy: CanActivateFn = createGuard<CanActivateFn>(true, 'guard3Truthy')
      const guard4Truthy: CanActivateFn = createGuard<CanActivateFn>(true, 'guard4Truthy')

      it('should call activation guards in a given sequence', async () => {
        const harness = await RouterTestingHarness.create()

        router.resetConfig([
          {
            path: '',
            canActivate: [
              chainActivationGuards([guard3Truthy, guard2Truthy, guard1Truthy, guard4Truthy])
            ],
            children: [
              {
                path: 'search',
                component: DummyComponent
              }
            ]
          }
        ])
        await harness.navigateByUrl('/search', DummyComponent)
        harness.detectChanges()

        expect(guardMap).toEqual({
          guard1Truthy: { end: 5, start: 4 },
          guard2Truthy: { end: 3, start: 2 },
          guard3Truthy: { end: 1, start: 0 },
          guard4Truthy: { end: 7, start: 6 }
        })
        expect(TestBed.inject(Router).url).toEqual('/search')
      })

      it('should should short circuit', async () => {
        const harness = await RouterTestingHarness.create()

        router.resetConfig([
          {
            path: '',
            canActivate: [chainActivationGuards([guard2Falsy, guard2Truthy])],
            children: [
              {
                path: 'search',
                component: DummyComponent
              }
            ]
          }
        ])

        await harness.navigateByUrl('/search')
        harness.detectChanges()

        expect(guardMap).toEqual({ guard2Falsy: { end: 1, start: 0 } })
        expect(TestBed.inject(Router).url).toEqual('/')
      })
    })

    describe('Chain Deactivation', () => {
      const guard1Truthy: CanDeactivateFn<never> = createGuard<CanDeactivateFn<never>>(
        true,
        'guard1Truthy'
      )
      const guard2Truthy: CanDeactivateFn<never> = createGuard<CanDeactivateFn<never>>(
        true,
        'guard2Truthy'
      )
      const guard2Falsy: CanDeactivateFn<never> = createGuard<CanDeactivateFn<never>>(
        false,
        'guard2Falsy'
      )
      const guard3Truthy: CanDeactivateFn<never> = createGuard<CanDeactivateFn<never>>(
        true,
        'guard3Truthy'
      )
      const guard4Truthy: CanDeactivateFn<never> = createGuard<CanDeactivateFn<never>>(
        true,
        'guard4Truthy'
      )

      it('should call deactivation guards in a given sequence', async () => {
        const harness = await RouterTestingHarness.create()

        router.resetConfig([
          {
            path: '',
            children: [
              {
                path: 'search',
                component: DummyComponent,
                canDeactivate: [
                  chainDeactivationGuards([guard3Truthy, guard2Truthy, guard1Truthy, guard4Truthy])
                ]
              },
              {
                path: 'list',
                component: DummyComponent
              }
            ]
          }
        ])
        await harness.navigateByUrl('/search')
        harness.detectChanges()

        await harness.navigateByUrl('/list')
        harness.detectChanges()

        expect(guardMap).toEqual({
          guard1Truthy: { end: 5, start: 4 },
          guard2Truthy: { end: 3, start: 2 },
          guard3Truthy: { end: 1, start: 0 },
          guard4Truthy: { end: 7, start: 6 }
        })
        expect(TestBed.inject(Router).url).toEqual('/list')
      })

      it('should should short circuit', async () => {
        const harness = await RouterTestingHarness.create()

        router.resetConfig([
          {
            path: '',
            children: [
              {
                path: 'search',
                component: DummyComponent,
                canDeactivate: [chainDeactivationGuards([guard2Falsy, guard2Truthy])]
              },
              {
                path: 'list',
                component: DummyComponent
              }
            ]
          }
        ])

        await harness.navigateByUrl('/search')
        harness.detectChanges()

        await harness.navigateByUrl('/list')
        harness.detectChanges()

        expect(guardMap).toEqual({ guard2Falsy: { end: 1, start: 0 } })
        expect(TestBed.inject(Router).url).toEqual('/search')
      })
    })
  })
  describe('Chained Functional Guards Rest', () => {
    let guardMap: Record<string, { start: number; end: number }> = {}
    let router: Router
    let offsetCounter = 0

    function createGuard<T extends CanActivateFn | CanDeactivateFn<never>>(
      returnValue: boolean,
      guardName: string
    ): T {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return ((..._args: never[]) => {
        guardMap[guardName] = { start: offsetCounter++, end: 0 }

        return of(returnValue).pipe(
          tap(
            () =>
              (guardMap[guardName] = {
                ...guardMap[guardName],
                end: offsetCounter++
              })
          )
        )
      }) as T
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [],
        teardown: { destroyAfterEach: true }
      })
      router = TestBed.inject(Router)
      guardMap = {}
      offsetCounter = 0
    })

    describe('Chain Activation', () => {
      const guard1Truthy: CanActivateFn = createGuard<CanActivateFn>(true, 'guard1Truthy')
      const guard2Truthy: CanActivateFn = createGuard<CanActivateFn>(true, 'guard2Truthy')
      const guard2Falsy: CanActivateFn = createGuard<CanActivateFn>(false, 'guard2Falsy')
      const guard3Truthy: CanActivateFn = createGuard<CanActivateFn>(true, 'guard3Truthy')
      const guard4Truthy: CanActivateFn = createGuard<CanActivateFn>(true, 'guard4Truthy')

      it('should call activation guards in a given sequence', async () => {
        const harness = await RouterTestingHarness.create()

        router.resetConfig([
          {
            path: '',
            canActivate: [
              chainActivationGuards([guard3Truthy, guard2Truthy, guard1Truthy, guard4Truthy])
            ],
            children: [
              {
                path: 'search',
                component: DummyComponent
              }
            ]
          }
        ])
        await harness.navigateByUrl('/search', DummyComponent)
        harness.detectChanges()

        expect(guardMap).toEqual({
          guard1Truthy: { end: 5, start: 4 },
          guard2Truthy: { end: 3, start: 2 },
          guard3Truthy: { end: 1, start: 0 },
          guard4Truthy: { end: 7, start: 6 }
        })
        expect(TestBed.inject(Router).url).toEqual('/search')
      })

      it('should should short circuit', async () => {
        const harness = await RouterTestingHarness.create()

        router.resetConfig([
          {
            path: '',
            canActivate: [chainActivationGuards(guard2Falsy, guard2Truthy)],
            children: [
              {
                path: 'search',
                component: DummyComponent
              }
            ]
          }
        ])

        await harness.navigateByUrl('/search')
        harness.detectChanges()

        expect(guardMap).toEqual({ guard2Falsy: { end: 1, start: 0 } })
        expect(TestBed.inject(Router).url).toEqual('/')
      })
    })

    describe('Chain Deactivation', () => {
      const guard1Truthy: CanDeactivateFn<never> = createGuard<CanDeactivateFn<never>>(
        true,
        'guard1Truthy'
      )
      const guard2Truthy: CanDeactivateFn<never> = createGuard<CanDeactivateFn<never>>(
        true,
        'guard2Truthy'
      )
      const guard2Falsy: CanDeactivateFn<never> = createGuard<CanDeactivateFn<never>>(
        false,
        'guard2Falsy'
      )
      const guard3Truthy: CanDeactivateFn<never> = createGuard<CanDeactivateFn<never>>(
        true,
        'guard3Truthy'
      )
      const guard4Truthy: CanDeactivateFn<never> = createGuard<CanDeactivateFn<never>>(
        true,
        'guard4Truthy'
      )

      it('should call deactivation guards in a given sequence', async () => {
        const harness = await RouterTestingHarness.create()

        router.resetConfig([
          {
            path: '',
            children: [
              {
                path: 'search',
                component: DummyComponent,
                canDeactivate: [
                  chainDeactivationGuards(guard3Truthy, guard2Truthy, guard1Truthy, guard4Truthy)
                ]
              },
              {
                path: 'list',
                component: DummyComponent
              }
            ]
          }
        ])
        await harness.navigateByUrl('/search')
        harness.detectChanges()

        await harness.navigateByUrl('/list')
        harness.detectChanges()

        expect(guardMap).toEqual({
          guard1Truthy: { end: 5, start: 4 },
          guard2Truthy: { end: 3, start: 2 },
          guard3Truthy: { end: 1, start: 0 },
          guard4Truthy: { end: 7, start: 6 }
        })
        expect(TestBed.inject(Router).url).toEqual('/list')
      })

      it('should should short circuit', async () => {
        const harness = await RouterTestingHarness.create()

        router.resetConfig([
          {
            path: '',
            children: [
              {
                path: 'search',
                component: DummyComponent,
                canDeactivate: [chainDeactivationGuards(guard2Falsy, guard2Truthy)]
              },
              {
                path: 'list',
                component: DummyComponent
              }
            ]
          }
        ])

        await harness.navigateByUrl('/search')
        harness.detectChanges()

        await harness.navigateByUrl('/list')
        harness.detectChanges()

        expect(guardMap).toEqual({ guard2Falsy: { end: 1, start: 0 } })
        expect(TestBed.inject(Router).url).toEqual('/search')
      })
    })
  })
})
