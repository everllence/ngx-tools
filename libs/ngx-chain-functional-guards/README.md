<p style="text-align: center;">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/everllence/ngx-tools/master/images/everllence-ngx-tools-dark.svg">
    <img alt="Everllence NGX · Tools" src="https://raw.githubusercontent.com/everllence/ngx-tools/master/images/everllence-ngx-tools-light.svg" width="100%">
  </picture>
</p>

<div style="text-align: center;">

[![License](https://img.shields.io/npm/l/@everllence%2Fngx-chain-functional-guards.svg?style=flat-square)]()
[![npm version](https://badge.fury.io/js/@everllence%2Fngx-chain-functional-guards.svg)]()
[![Semantic Release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)]()

</div>

<hr>

# Ngx Chain Functional Guards

Ngx Chain Functional Guards is a small library that provides functions to control the execution flow of Angular route guards. It includes **chainActivationGuards** and **chainDeactivationGuards** for serial execution, and **parallelizeActivationGuards** for parallel execution of independent guards.

## Installation

Requires the following peer dependencies:

- @angular/core (>= 19.0.0)
- @angular/router (>= 19.0.0)
- rxjs (>= 7.0.0)

## Example

### canActivate, canActivateChild

```ts
import { chainActivationGuards } from 'ngx-chain-functional-guards';

// In the route config:
{
  path: '...',
  // chain the desired guards
  canActivate: [chainActivationGuards(SomeGuard1, SomeGuard2, ...)],
  ...
}
```

### canDeactivate

```ts
import { chainDeactivationGuards } from 'ngx-chain-guards';

// In the route config:
{
  path: '...',
  // chain the desired guards
  canDeactivate: [chainDeactivationGuards(SomeGuard1, SomeGuard2, ...)],
}
```

### Combining Serial and Parallel Guards

For performance optimization, you can mix serial and parallel guard execution. This is useful when some guards depend on each other while others are independent:

```ts
import { chainActivationGuards, parallelizeActivationGuards } from 'ngx-chain-functional-guards';

// In the route config:
{
  path: '...',
  canActivate: [
    chainActivationGuards(
      guard1,                                    // Runs first
      guard2,                                    // Runs after guard1 (depends on guard1)
      parallelizeActivationGuards(guard3, guard4), // guard3 and guard4 run in parallel
      guard5                                     // Runs after guard3 and guard4 complete
    )
  ],
  ...
}
```

In this example:

- `guard1` executes first
- `guard2` waits for `guard1` to complete (sequential dependency)
- `guard3` and `guard4` run in parallel (independent guards)
- `guard5` waits for both `guard3` and `guard4` to complete

## API

### chainActivationGuards

The **chainActivationGuards** function executes guards in a serial manner, waiting for each one to complete before proceeding to the next.

```typescript
export declare function chainActivationGuards(...guards: CanActivateFn[]): CanActivateFn
export declare function chainActivationGuards(...guards: CanActivateChildFn[]): CanActivateChildFn
```

### chainDeactivationGuards

The **chainDeactivationGuards** function executes deactivation guards in a serial manner.

```typescript
export declare function chainDeactivationGuards(
  ...guards: CanDeactivateFn<never>[]
): CanDeactivateFn<never>
```

### parallelizeActivationGuards

The **parallelizeActivationGuards** function runs all given guards in parallel without waiting for each other. It completes immediately if any guard returns a non-true result, or waits for all guards to complete if they all return true. This is useful for performance optimization when guards are independent and don't have dependencies on each other.

```typescript
export declare function parallelizeActivationGuards(...guards: CanActivateFn[]): CanActivateFn
```

**Use case:** Combine with `chainActivationGuards` to optimize guard execution when you have a mix of dependent and independent guards.

### Utilities

#### wrapIntoObservable

A lightweight utility function that normalizes any value—whether it's a plain value, a Promise, or an Observable—into an Observable. This is especially useful in Angular or RxJS-heavy applications where consistent reactive patterns are desired.

```typescript
export declare function wrapIntoObservable<T>(value: T | Promise<T> | Observable<T>): Observable<T> {
```
