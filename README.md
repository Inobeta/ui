# README

- [README](#readme)
  - [Naming convention](#naming-convention)
  - [How to version](#how-to-version)
  - [How to install](#how-to-install)
  - [Upgrade notes](#upgrade-notes)
    - [From 1.1.x to 9.x](#from-11x-to-9x)

## Naming convention

kebab case

- file names (es: `material-breadcrumb.component.ts`)
- selector names (es: `<ib-material-breadcrumb></ib-material-breadcrumb>`)

upper camel case:

- class names (es: `IbMaterialBreadcrumbComponent`)

lower camel case:

- istance of components/class (es: `ViewChild('ibMaterialBreadcrumbComponent', {static: false}) ibMaterialBreadcrumbComponent: IbMaterialBreadcrumbComponent`)
- function names

All classes/components/services must have "Ib" prefix

All selectors must have "ib-" prefix

other examples on:

- <https://github.com/angular/components/tree/master/src/material>
- <https://angular.io/guide/styleguide>

## How to version

Before work, run the change type

Bug fixes

```bash
npm run patch
```

New feature

```bash
npm run minor
```

Breaking changes

```bash
npm run major
```

Setup gitlab registry  (manual)

```bash
npm config set @inobeta:registry https://gitlab.com/api/v4/packages/npm/
npm config set '//gitlab.com/api/v4/packages/npm/:_authToken' "GITLAB_TOKEN"
npm config set '//gitlab.com/api/v4/projects/8604184/packages/npm/:_authToken' "GITLAB_TOKEN"
echo @inobeta:registry=https://gitlab.com/api/v4/packages/npm/ >> .npmrc
```

## How to install

After gitlab setup registry:

```bash
npm i --save @inobeta/ui
```

then, define your theme.scss with this example (customize your palette)

```scss
@use '@angular/material' as mat;
@use '@inobeta-ui/ui';
@include mat.core();

// Define the default theme
$app-primary: mat.define-palette(mat.$deep-purple-palette);
$app-accent: mat.define-palette(mat.$amber-palette, A200, A100, A400);
$app-warning: mat.define-palette(mat.$red-palette);

$app-theme: mat.define-light-theme((
  color: (
    primary: $app-primary,
    accent: $app-accent,
    warning: $app-warning
  )
));

// Include the default theme styles.
@include ui.theme($app-theme);
// Overwrites and other styles here
// ...
```

Last, force translate loading on app.component:

```typescript
    this.translateService.use('it');
    this.translateService.reloadLang(this.translateService.currentLang).subscribe(() => {
      this.translateLoaded = true;
    })
```

and wrap out the root top element in a *ngIf="translateLoaded" clause, in order to use translateService.instant safetly

Live examples at <https://ui-examples.inobeta.net/>

## Upgrade notes

### From 1.1.x to 9.x

Add this line in main.ts:

```typescript
import '@angular/compiler';
```

Store module import has changed as:

```typescript
StoreModule.forRoot(reducers, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: false,
        strictActionImmutability: false,
      },
    }),
```

Remove any imports of ibSessionReducer and ibTableFiltersReducer, they will be import by their own module.

Set sessionState and tableFiltersState as optional in IAppState

Add a storageKey for storageKeySerializer in localStorageSync function call, example:

```typescript
const storageKey = 'Inotracer';

export const providers = [
  {provide: 'SessionStorageKey', useValue: storageKey},
[...]
];

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({
    keys: ['sessionState', 'tableFiltersState', 'sideMenuState', 'processingGoodsState'],
    storageKeySerializer: (key) => `${storageKey}-${key}`,
    rehydrate: true
  })(reducer);
}
```
