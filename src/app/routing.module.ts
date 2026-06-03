
import { Routes } from '@angular/router';
import { DialogExampleComponent } from './examples/dialog-example/dialog-example.component';
import { IbKaiTableActionColumnExamplePage } from './examples/kai-table-example/kai-table-actions-example';
import { IbKaiTableColumnOptionsExamplePage } from './examples/kai-table-example/kai-table-column-options-example';
import { IbKaiTableCustomAggregateExamplePage } from './examples/kai-table-example/kai-table-custom-aggregate-example';
import { IbKaiTableCustomSortFilterExamplePage } from './examples/kai-table-example/kai-table-custom-sort-filter-example';
import { IbKaiTableDatasourceExamplePage } from './examples/kai-table-example/kai-table-datasource-example';
import { KaiTableDetailComponent } from './examples/kai-table-example/kai-table-detail';
import { IbKaiTableExamplePage } from './examples/kai-table-example/kai-table-example';
import { IbKaiTableFullExamplePage } from './examples/kai-table-example/kai-table-full-example';
import { IbKaiTableStickyExamplePage } from './examples/kai-table-example/kai-table-sticky-example';
import { IbKaiTableWithRouting } from './examples/kai-table-example/kai-table-with-routing';
import { IbKaiTableApiExamplePage } from './examples/kai-table-example/server-side/kai-table-api-example';
import { IbKaiTableMobileEmptyExamplePage } from './examples/kai-table-example/kai-table-mobile-empty-example';
import { NavComponent } from './examples/nav/nav.component';
import { IbToastExampleComponent } from './examples/toast-example/toast-example.component';

export const appRoutes: Routes = [
  {
    path: 'home',
    component: NavComponent,
    children: [
      {
        path: 'dialog',
        data: { breadcrumb: 'Dialog' },
        component: DialogExampleComponent,
      },
      {
        path: 'toast',
        data: { breadcrumb: 'examples.toastMenu' },
        component: IbToastExampleComponent
      },
      {
        path: 'kai-table',
        data: { breadcrumb: 'Table' },
        children: [
          {
            path: 'simple',
            data: { breadcrumb: 'Simple' },
            component: IbKaiTableExamplePage
          },
          {
            path: 'actions',
            data: { breadcrumb: 'Actions' },
            component: IbKaiTableActionColumnExamplePage
          },
          {
            path: 'api',
            data: { breadcrumb: 'Api' },
            component: IbKaiTableApiExamplePage
          },
          {
            path: 'full',
            data: { breadcrumb: 'Full' },
            component: IbKaiTableFullExamplePage
          },
          {
            path: 'with-routing',
            data: { breadcrumb: 'With Routing' },
            component: IbKaiTableWithRouting,
            children: [
              {
                path: 'details/:id',
                data: { breadcrumb: 'Details' },
                component: KaiTableDetailComponent
              }
            ]
          },
          {
            path: 'datasource',
            data: { breadcrumb: 'DataSource' },
            component: IbKaiTableDatasourceExamplePage
          },
          {
            path: 'sticky',
            data: { breadcrumb: 'Sticky Columns' },
            component: IbKaiTableStickyExamplePage
          },
          {
            path: 'custom-sort-filter',
            data: { breadcrumb: 'Custom Sort & Filter' },
            component: IbKaiTableCustomSortFilterExamplePage
          },
          {
            path: 'custom-aggregate',
            data: { breadcrumb: 'Custom Aggregate' },
            component: IbKaiTableCustomAggregateExamplePage
          },
          {
            path: 'column-options',
            data: { breadcrumb: 'Column Options' },
            component: IbKaiTableColumnOptionsExamplePage
          },
          {
            path: 'mobile-empty',
            data: { breadcrumb: 'Empty Tables' },
            component: IbKaiTableMobileEmptyExamplePage
          },
          {
            path: '',
            redirectTo: 'simple',
            pathMatch: 'full'
          }
        ]
      },
      {
        path: '',
        redirectTo: 'kai-table',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];
