# AGENTS.md — Coding Agent Reference

This file provides guidance for AI coding agents (and humans) working in this repository.

---

## Project Overview

This is **inobeta-ui**, an Angular component library (Angular 20+) built with NgRx, Angular Material,
and ngx-translate. The `src/app/inobeta-ui/` directory contains the library source; `src/app/examples/`
contains a demo application. The library is built via `ng-packagr`.

---

## Commands

### Development
```bash
npm start               # Serve the demo app (ng serve)
npm run storybook       # Run Storybook
```

### Build
```bash
npm run build           # Build demo app (production)
npm run packagr         # Build the library via ng-packagr
npm run release         # Build library + npm pack
```

### Lint
```bash
npm run lint            # ng lint (ESLint via Angular CLI)
```

### Test
```bash
npm test                # Run all tests in watch mode with coverage (ChromeHeadless)
npm run test-ci         # Run all tests once (no watch), for CI
```

#### Run a single test file
```bash
ng test --include='src/app/inobeta-ui/ui/toast/toast.service.spec.ts' --watch=false
```
Replace the path glob with any `**/*.spec.ts` pattern. The `--include` flag is supported by Angular CLI.

#### Focus a single test interactively
Use `fdescribe` / `fit` in the spec file to focus a suite or test without changing CLI flags.
Remember to remove `fdescribe` / `fit` before committing.

### Coverage thresholds
Karma enforces **80%** minimum for statements, lines, branches, and functions.

---

## Repository Structure

```
/
├── public_api.ts              # Library barrel export (all public symbols)
├── ng-package.json            # ng-packagr config
├── src/
│   ├── app/
│   │   ├── app.config.ts      # Standalone ApplicationConfig bootstrap
│   │   ├── core/              # App-level NgRx store & types (demo app)
│   │   ├── examples/          # Demo/showcase feature components
│   │   └── inobeta-ui/        # LIBRARY SOURCE
│   │       ├── core/          # Shared directives & pipes
│   │       ├── http/          # Auth, interceptors, guards, skeleton loading
│   │       ├── hydration/     # NgRx state persistence helpers
│   │       ├── storage/       # Local/session storage abstraction
│   │       ├── tools/         # Test utilities (IbToolTestModule)
│   │       ├── translate/     # Lazy translate loader
│   │       └── ui/            # UI components (table, forms, modal, toast…)
│   ├── karma.conf.js
│   └── test.ts
```

Every feature folder exposes its public API through an `index.ts` barrel.

---

## Code Style

### Formatting (.editorconfig)
- **Indent:** 2 spaces (no tabs)
- **Charset:** UTF-8
- **Final newline:** required
- **Trailing whitespace:** trimmed (except Markdown)

### TypeScript
- Target: `ES2022`; module: `es2022`; moduleResolution: `bundler`
- `experimentalDecorators: true`, `useDefineForClassFields: false` (legacy decorator semantics)
- `esModuleInterop: true`, `resolveJsonModule: true`
- Strict null checks are **not** globally enforced — avoid introducing `any`; prefer explicit types
- Use `tslib` helpers (`importHelpers: true`)

### Naming Conventions

| Construct | Convention | Example |
|---|---|---|
| Classes (components, services, directives, modules) | `Ib` prefix + PascalCase | `IbKaiTableComponent`, `IbToastNotification` |
| Interfaces / types | `Ib` prefix + PascalCase | `IbTableDef`, `IbModalMessage` |
| CSS selectors | `ib-` prefix + kebab-case | `ib-kai-table`, `ib-modal-message` |
| File names | kebab-case with Angular type suffix | `kai-table.component.ts`, `toast.service.ts` |
| Spec stubs | `<feature>.stub.spec.ts` | `toast.service.stub.spec.ts` |
| Barrel files | `index.ts` in each feature folder | `ui/toast/index.ts` |

### Imports
- Always import from the **barrel** (`index.ts`) of a feature folder, never from the internal file directly.
- Group imports: Angular core → Angular libs → third-party → internal (barrel).
- Avoid deep relative paths (e.g., `../../../../`); prefer path aliases if available.

### Components
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
- Use `takeUntil(this._destroyed)` for subscription cleanup.
- New code may use Angular signals (`input()`, `signal()`, `effect()`, `toSignal()`);
  both signal-based and classic `@Input()` / `@Output()` patterns coexist.

### Services
```typescript
@Injectable({ providedIn: 'root' })
export class IbSomeService {
  // Constructor injection is the primary pattern:
  constructor(private dep: SomeDep) {}

  // inject() is acceptable in newer code:
  private store = inject(Store);
}
```

### Modules
- Each library feature has a dedicated `NgModule` (e.g., `IbKaiTableModule`).
- Always include `TranslateModule.forChild({ extend: true })` in library feature modules.
- Use `provideState()` / `provideEffects()` inside `@NgModule.providers` for NgRx slices.
- Expose a `static forRoot()` factory only when root-level configuration is required.

### Error Handling
Use the RxJS 7+ factory form of `throwError`:
```typescript
catchError((err) => {
  // optional: show toast notification
  return throwError(() => err);
})
```
Never swallow errors silently. Log or surface via the toast service.

### Deprecations
Mark deprecated symbols with JSDoc **and** the `@deprecated` tag on the class/function:
```typescript
/**
 * @deprecated This element will be removed in v21. Use IbMaterialFormsModule instead.
 */
export class IbDynamicFormsModule {}
```

---

## Testing Guidelines

### Framework
Karma + Jasmine with ChromeHeadless. No Jest.

### Test file conventions
- One `*.spec.ts` per source file, co-located.
- Stub/mock classes live in `*.stub.spec.ts` files and are imported by real spec files.
- Never commit `fdescribe` or `fit`; use `xdescribe` / `xit` with a comment to skip a broken test.

### Module setup boilerplate
```typescript
beforeEach(waitForAsync(() => {
  TestBed.configureTestingModule({
    declarations: [MyComponent],
    imports: [NoopAnimationsModule, TranslateModule.forRoot(), ...],
    providers: [...],
  }).compileComponents();
}));
```
- Always import `NoopAnimationsModule` in component tests that use Angular Material.
- Use `fakeAsync()` + `tick()` for timer/debounce logic.
- Use Angular CDK Harnesses (`MatTableHarness`, `MatButtonHarness`, etc.) for robust UI assertions.

### Coverage
Tests must maintain ≥ 80% coverage across statements, lines, branches, and functions.
Run `npm run test-ci` to validate coverage locally before pushing.

---

## Angular & Library Specifics

- **Angular version:** 20 (standalone bootstrap in the demo app; library components use `standalone: false`)
- **NgRx version:** 20 (`@ngrx/store`, `@ngrx/effects`, `@ngrx/store-devtools`)
- **ngx-translate:** `^16`; always use `TranslateModule.forChild({ extend: true })` in feature modules
- **Angular Material:** `^20`; follow Material theming — do not hard-code colors, use theme tokens
- **ng-packagr:** generates the distributable under `dist/`; `public_api.ts` is the single entry point
- Peer dependencies (`rxjs`, `@ngrx/*`, `ngx-translate`, etc.) must **not** be bundled; mark as `peerDependencies`

---

## Git & PR Guidelines

- Branch from `main`; use descriptive branch names (`feature/`, `fix/`, `chore/`)
- Commit messages: imperative mood, present tense (e.g., `add filter persistence to IbKaiTable`)
- Run `npm run lint` and `npm run test-ci` before opening a PR
- Do not introduce breaking changes to `public_api.ts` exports without a major version bump
