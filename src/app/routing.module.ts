
import { Routes } from '@angular/router';
import { DialogExampleComponent } from './examples/dialog-example/dialog-example.component';
import { IbKaiTableActionColumnExamplePage } from './examples/kai-table-example/kai-table-actions-example';
import { KaiTableDetailComponent } from './examples/kai-table-example/kai-table-detail';
import { IbKaiTableExamplePage } from './examples/kai-table-example/kai-table-example';
import { IbKaiTableFullExamplePage } from './examples/kai-table-example/kai-table-full-example';
import { IbKaiTableWithRouting } from './examples/kai-table-example/kai-table-with-routing';
import { IbKaiTableApiExamplePage } from './examples/kai-table-example/server-side/kai-table-api-example';
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
