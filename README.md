# Naming convention

kebab case 
- file names (es: `material-breadcrumb.component.ts`)
- selector names (es: `<ib-material-breadcrumb></ib-material-breadcrumb>`)

upper camel case:
- class names (es: `IbMaterialBreadcrumbComponent`)

lower camel case:
- istance of components/class (es: `ViewChild('ibMaterialBreadcrumbComponent', {static: false}) ibMaterialBreadcrumbComponent: IbMaterialBreadcrumbComponent `)
- function names

All classes/components/services must have "Ib" prefix

All selectors must have "ib-" prefix

other examples on: 
- https://github.com/angular/components/tree/master/src/material
- https://angular.io/guide/styleguide



# How to version

Before work, run the change type

Bug fixes
```
npm run patch
```

New feature
```
npm run minor
```

Breaking changes
```
npm run major
```

Setup gitlab registry  (manual)
```
npm config set @inobeta:registry https://gitlab.com/api/v4/packages/npm/
npm config set '//gitlab.com/api/v4/packages/npm/:_authToken' "GITLAB_TOKEN"
npm config set '//gitlab.com/api/v4/projects/8604184/packages/npm/:_authToken' "GITLAB_TOKEN"
echo @Inobeta:registry=https://gitlab.com/api/v4/packages/npm/ >> .npmrc
```


# How to install

After gitlab setup registry:

```
npm i --save @Inobeta/ui
```

then, define your theme.scss with this example (customize your palette)

```
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
```
    this.translateService.use('it');
    this.translateService.reloadLang(this.translateService.currentLang).subscribe(() => {
      this.translateLoaded = true;
    })
```
and wrap out the root top element in a *ngIf="translateLoaded" clause, in order to use translateService.instant safetly

Live examples at https://ui-examples.inobeta.net/

