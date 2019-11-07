import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {AppComponent} from './app.component';
import {TabExampleComponent} from '../examples/ib-tabExample.component';
import {MyCounterComponent} from '../examples/redux-example/my-counter.component';

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
  },
  { path: 'mycounter',
    component: MyCounterComponent
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

