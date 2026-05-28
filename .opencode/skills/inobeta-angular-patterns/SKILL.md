---
name: inobeta-angular-patterns
description: >-
  Apply when writing or modifying Angular components, services, directives, or modules
  inside inobeta-ui. Enforces component structure, lifecycle, signal usage, subscription
  cleanup, NgModule setup, and template discipline specific to this library.
compatibility: opencode
---

## Purpose

This skill captures Angular implementation patterns that apply to every component or
service inside the **inobeta-ui** library.

---

## Component Structure

```typescript
@Component({
  selector: 'ib-some-component',
  templateUrl: './some.component.html',
  styleUrls: ['./some.component.scss'],
  standalone: false,   // always explicit for NgModule-based components
})
export class IbSomeComponent implements OnDestroy {
  private _destroyed = new Subject<void>();

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
```

- `standalone: false` must always be stated explicitly on NgModule-based components.
- Use `takeUntil(this._destroyed)` for every RxJS subscription in class-based components.
- In standalone/signal-first components, unsubscribe explicitly in `ngOnDestroy`
  (e.g. `this.subscription.unsubscribe()`).

---

## Signals vs Classic Inputs

- New reactive logic must use Angular signals: `input()`, `output()`, `signal()`,
  `computed()`, `effect()`, `toSignal()`.
- Retain existing `@Input()` / `@Output()` decorators where already established — do not
  migrate them unless the task explicitly requires it.
- Standalone components written signal-first must stay signal-first.

---

## Services

```typescript
@Injectable({ providedIn: 'root' })
export class IbSomeService {
  // Constructor injection is the primary pattern:
  constructor(private dep: SomeDep) {}

  // inject() is acceptable in newer code:
  private store = inject(Store);
}
```

---

## NgModule Setup

- Each library feature has a dedicated `NgModule` (e.g. `IbKaiTableModule`).
- Always include `TranslateModule.forChild({ extend: true })` in library feature modules.
- Use `provideState()` / `provideEffects()` inside `@NgModule.providers` for NgRx slices.
- Expose a `static forRoot()` factory only when root-level configuration is required.

---

## Template Discipline

- Never use TypeScript syntax, `as`, type assertions, or union types inside templates.
- Move typing and casting logic into the component class.
- Always handle nullable values before accessing properties in templates.
- Avoid calling the same method multiple times in a template when a local variable suffices.
- Keep template expressions simple; extract complex logic into typed methods or computed
  signals on the component class.

---

## Error Handling

Use the RxJS 7+ factory form of `throwError`:

```typescript
catchError((err) => {
  // optional: surface via toast service
  return throwError(() => err);
})
```

Never swallow errors silently. Log or surface them via the toast service.

---

## Deprecations

```typescript
/**
 * @deprecated This element will be removed in v21. Use IbMaterialFormsModule instead.
 */
export class IbDynamicFormsModule {}
```

Mark deprecated symbols with a JSDoc comment **and** the `@deprecated` tag.
