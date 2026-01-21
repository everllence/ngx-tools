import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router'

import { first, last, merge, of, takeWhile } from 'rxjs'

import { wrapIntoObservable } from './utils/rxjs.utils'

/**
 * Runs all given guards in parallel without waiting for each other. Completes if any guard returns a non-true result.
 * This is the default behavior of canActivate, but this function can be used within a chainActivationGuards call
 * in order to make the parallelized group run only after higher priority guards.
 *
 * @param guards a list of activation guard functions
 * @returns the first non-true result of a guard, or true
 */
export const parallelizeActivationGuards =
  (...guards: Array<CanActivateFn>): CanActivateFn =>
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    if (!guards.length) {
      return of(true)
    }

    const injector = inject(EnvironmentInjector)

    return merge(
      ...guards.map(guard => {
        const preloaderResult = runInInjectionContext(injector, () => guard(route, state))
        return wrapIntoObservable(preloaderResult).pipe(first())
      })
    ).pipe(
      takeWhile(result => result === true, true),
      last()
    )
  }
