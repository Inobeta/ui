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
