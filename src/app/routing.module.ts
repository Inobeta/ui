
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
import { IbKaiTableParentHeightExamplePage } from './examples/kai-table-example/kai-table-parent-height-example';
import { IbKaiTableStickyExamplePage } from './examples/kai-table-example/kai-table-sticky-example';
import { IbKaiTableStickyParentExamplePage } from './examples/kai-table-example/kai-table-sticky-parent-height-example';
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
        component: DialogExampleComponent,
      },
      {
        path: 'toast',
        component: IbToastExampleComponent
      },
      {
        path: 'kai-table',
        children: [
          {
            path: 'simple',
            component: IbKaiTableExamplePage
          },
          {
            path: 'actions',
            component: IbKaiTableActionColumnExamplePage
          },
          {
            path: 'api',
            component: IbKaiTableApiExamplePage
          },
          {
            path: 'full',
            component: IbKaiTableFullExamplePage
          },
          {
            path: 'with-routing',
            component: IbKaiTableWithRouting,
            children: [
              {
                path: 'details/:id',
                component: KaiTableDetailComponent
              }
            ]
          },
          {
            path: 'datasource',
            component: IbKaiTableDatasourceExamplePage
          },
          {
            path: 'sticky',
            component: IbKaiTableStickyExamplePage
          },
          {
            path: 'parent-height',
            component: IbKaiTableParentHeightExamplePage
          },
          {
            path: 'sticky-parent',
            component: IbKaiTableStickyParentExamplePage
          },
          {
            path: 'custom-sort-filter',
            component: IbKaiTableCustomSortFilterExamplePage
          },
          {
            path: 'custom-aggregate',
            component: IbKaiTableCustomAggregateExamplePage
          },
          {
            path: 'column-options',
            component: IbKaiTableColumnOptionsExamplePage
          },
          {
            path: 'mobile-empty',
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
