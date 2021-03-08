import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import { IbTableExampleComponent } from 'src/app/examples/table-example/table-example.component';
import { HomeComponent } from 'src/app/examples/home.component';
import { DynamicFormsExampleComponent } from './examples/dynamic-forms-example/dynamic-forms-example.component';
import { HttpExampleComponent } from './examples/http-example.component';
import { MyCounterComponent } from './examples/redux-example/my-counter.component';
import { DialogExampleComponent } from './examples/dialog-example/dialog-example.component';

const appRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'table',
    data: { breadcrumb: 'Table' },
    component: IbTableExampleComponent
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
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ],
})
export class RoutingModule {}

