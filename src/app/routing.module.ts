import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {AppComponent} from './app.component';
import {TabExampleComponent} from '../examples/ib-tabExample.component';

const appRoutes: Routes = [
  {
    path: 'welcome',
    component: AppComponent
  },
  { path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  { path: 'tabExample',
    component: TabExampleComponent
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

