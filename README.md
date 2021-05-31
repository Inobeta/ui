# README

1. [Naming convention](#Naming-convention)
2. [How to version](#How-to-version)
3. [How to install](#How-to-install)
4. [Upgrade notes](#Upgrade-notes)
    1. [From 1.1.x to 9.x](#From-1.1.x-to-9.x)

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
echo @Inobeta:registry=https://gitlab.com/api/v4/packages/npm/ >> .npmrc
```

## How to install

After gitlab setup registry:

```bash
npm i --save @Inobeta/ui
```

then, define your theme.scss with this example (customize your palette)

```typescript
@import '~@angular/material/theming';
@import '../inobeta-ui/themes/default.scss';
@include mat-core();

$app-primary: mat-palette($mat-deep-purple);
$app-accent: mat-palette($mat-amber, A200, A100, A400);
$app-warning: mat-palette($mat-red);

$app-theme: mat-light-theme($app-primary, $app-accent, $app-warning);

@include inobeta-ui-theme($app-theme);
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
