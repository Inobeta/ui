import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {AppComponent} from './app.component';
import {MyCounterComponent} from '../examples/redux-example/my-counter.component';
import { IbTableExampleComponent } from 'src/examples/ib-tableExample.component';

const appRoutes: Routes = [
  {
    path: 'welcome',
    component: AppComponent
  },
  { path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  { path: 'mycounter',
    component: MyCounterComponent
  },
  {
    path: 'table',
    component: IbTableExampleComponent
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

