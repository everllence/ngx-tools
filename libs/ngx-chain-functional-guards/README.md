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

Ngx Chain Functional Guards is a small library that exposes two functions **chainActivationGuards**  and **chainDeactivationGuards**. Both of these functions allow to run guards in a serial manner, waiting for each one to complete before proceeding to the next.

## Installation

Requires the following peer dependencies:

- @angular/core  (>= 18.0.0)
- @angular/router  (>= 18.0.0)
- rxjs (>= 7.0.0)


## Example
### canActivate, canActivateChild
```ts
import { chainActivationGuards } from 'ngx-chain-functional-guards';

// In the route config:
{
  path: '...',
  // chain the desired guards
  canActivate: [chainActivationGuards([SomeGuard1, SomeGuard2, ...])],
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
  canDeactivate: [chainDeactivationGuards([SomeGuard1, SomeGuard2, ...])],
}
```

## API
### CanActivateChildFn, CanActivateFn
The **chainActivationGuards** function lets you add an array of guards to be executed in a serial manner.

```typescript
export declare function chainActivationGuards(guards: CanActivateFn[] | CanActivateChildFn[]): CanActivateFn | CanActivateChildFn
```

### CanDeactivateFn
The **chainDeactivationGuards** function lets you add an array of guards to be executed in a serial manner.

```typescript
export declare function chainDeactivationGuards(guards: CanDeactivateFn<never>[]): CanDeactivateFn<never>
```
