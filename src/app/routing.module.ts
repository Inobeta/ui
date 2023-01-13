import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import { IbTableExampleComponent } from 'src/app/examples/table-example/table-with-redux/table-example.component';
import { DynamicFormsExampleComponent } from './examples/dynamic-forms-example/dynamic-forms-example.component';
import { HttpExampleComponent } from './examples/http-example.component';
import { MyCounterComponent } from './examples/redux-example/my-counter.component';
import { DialogExampleComponent } from './examples/dialog-example/dialog-example.component';
import { IbToastExampleComponent } from './examples/toast-example/toast-example.component';
import { IbTableExampleNoReduxComponent } from './examples/table-example/table-without-redux/table-example.component';
import { IbTableStickyExampleComponent } from './examples/table-example/table-sticky/table-example.component';
import { NavComponent } from './examples/nav/nav.component';
import { IbKaiTableExamplePage } from './examples/kai-table-example/kai-table-example';
import { IbKaiTableContextActionExamplePage } from './examples/kai-table-example/kai-table-context-action-example';
import { IbKaiTableFullExamplePage } from './examples/kai-table-example/kai-table-full-example';

const appRoutes: Routes = [
  {
    path: 'home',
    component: NavComponent,
    children: [
      {
        path: 'table',
        data: { breadcrumb: 'Table' },
        children: [
          {
            path: 'redux',
            component: IbTableExampleComponent,
            data: { breadcrumb: '' },
          },
          {
            path: 'noredux',
            data: { breadcrumb: 'Without redux' },
            component: IbTableExampleNoReduxComponent
          },
          {
            path: 'sticky',
            data: { breadcrumb: 'Sticky' },
            component: IbTableStickyExampleComponent
          },
          {
            path: '',
            redirectTo: 'redux',
            pathMatch: 'full'
          }
        ]
      },
      {
        path: 'forms',
        data: { breadcrumb: 'Forms' },
        component: DynamicFormsExampleComponent,
      },
      {
        path: 'redux',
        data: { breadcrumb: 'Redux' },
        component: MyCounterComponent,
      },
      {
        path: 'http',
        data: { breadcrumb: 'Http' },
        component: HttpExampleComponent,
      },
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
            path: 'context-action',
            data: { breadcrumb: 'Context Action' },
            component: IbKaiTableContextActionExamplePage
          },
          {
            path: 'full',
            data: { breadcrumb: 'Full' },
            component: IbKaiTableFullExamplePage
          }
        ]
      },
      {
        path: '',
        redirectTo: 'table',
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

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes, {})
  ],
  exports: [
    RouterModule
  ],
})
export class RoutingModule {}

