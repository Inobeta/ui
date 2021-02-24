# Breadcrumbs

Per utilizzare le breadcrumbs è sufficiente aggiungere il componente alla pagina principale del progetto e inserire la prorietà `breadcrumb` nel `data` delle routes.

```html
<ib-material-breadcrumb></ib-material-breadcrumb>
<router-outlet></router-outlet>
```

```javascript
{
  path: 'table',
  data: { breadcrumb: 'Table' },
  component: IbTableExampleComponent
},
```