import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  CanActivateFn,
  CanDeactivateFn,
  RouterStateSnapshot
} from '@angular/router'

import { concatMap, first, from, last, takeWhile } from 'rxjs'

import { wrapIntoObservable } from './utils/rxjs.utils'

/**
 * Chains route configured guards on canActivate, calling them after each other, waiting for each one before calling the next.
 *
 * @param guards The array of guards to process.
 * @returns The result of the first guard that returns `false` or an instance of a `UrlTree`, otherwise `true`.
 * @deprecated Use the rest parameter signature instead: `chainActivationGuards(guard1, guard2, ...)`. This overload will be removed in a future version.
 */
export function chainActivationGuards(guards: CanActivateFn[]): CanActivateFn
/**
 * Chains route configured guards on canActivateChild, calling them after each other, waiting for each one before calling the next.
 *
 * @param guards The array of guards to process.
 * @returns The result of the first guard that returns `false` or an instance of a `UrlTree`, otherwise `true`.
 * @deprecated Use the rest parameter signature instead: `chainActivationGuards(guard1, guard2, ...)`. This overload will be removed in a future version.
 */
export function chainActivationGuards(guards: CanActivateChildFn[]): CanActivateChildFn

/**
 * Chains route configured guards on canActivateChild, calling them after each other, waiting for each one before calling the next.
 *
 * @param guards The array of guards to process.
 * @returns The result of the first guard that returns `false` or an instance of a `UrlTree`, otherwise `true`.
 */
export function chainActivationGuards(...guards: CanActivateFn[]): CanActivateFn
/**
 * Chains route configured guards on canActivateChild, calling them after each other, waiting for each one before calling the next.
 *
 * @param guards The array of guards to process.
 * @returns The result of the first guard that returns `false` or an instance of a `UrlTree`, otherwise `true`.
 */
export function chainActivationGuards(...guards: CanActivateChildFn[]): CanActivateChildFn
export function chainActivationGuards(
  ...guards: (CanActivateFn | CanActivateChildFn)[] | [CanActivateFn[]] | [CanActivateChildFn[]]
): CanActivateFn | CanActivateChildFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const injector = inject(EnvironmentInjector)

    // Flatten guards: if first argument is an array, use it; otherwise use rest params
    const flatGuards =
      Array.isArray(guards[0]) && guards.length === 1
        ? guards[0]
        : (guards as (CanActivateFn | CanActivateChildFn)[])

    return from(flatGuards).pipe(
      concatMap(guard => {
        const guardResult = runInInjectionContext(injector, () => guard(route, state))
        return wrapIntoObservable(guardResult).pipe(first())
      }),
      takeWhile(val => val === true, true),
      last()
    )
  }
}

/**
 * Chains route configured guards on canDeactivate, calling them after each other, waiting for each one before calling the next.
 *
 * @param guards The array of guards to process.
 * @returns The result of the first guard that returns `false` or an instance of a `UrlTree`, otherwise `true`.
 */
// --- Backward-compatible single-array overloads ---
export function chainDeactivationGuards(guards: CanDeactivateFn<never>[]): CanDeactivateFn<never>

// --- New ergonomic rest-parameter overloads (pass guards directly) ---
export function chainDeactivationGuards(...guards: CanDeactivateFn<never>[]): CanDeactivateFn<never>

// --- Implementation signature (broad; not picked at call sites) ---
export function chainDeactivationGuards(
  ...guards: CanDeactivateFn<never>[] | [CanDeactivateFn<never>[]]
): CanDeactivateFn<never> {
  return (
    component: never,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ) => {
    const injector = inject(EnvironmentInjector)

    // Flatten guards: if first argument is an array, use it; otherwise use rest params
    const flatGuards =
      Array.isArray(guards[0]) && guards.length === 1
        ? guards[0]
        : (guards as CanDeactivateFn<never>[])

    return from(flatGuards).pipe(
      concatMap(guard => {
        const guardResult = runInInjectionContext(injector, () =>
          guard(component, route, state, nextState)
        )
        return wrapIntoObservable(guardResult).pipe(first())
      }),
      takeWhile(val => val === true, true),
      last()
    )
  }
}
