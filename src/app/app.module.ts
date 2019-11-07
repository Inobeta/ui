import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import {InobetaUiModule} from './inobeta-ui/inobetaUi.module';
import {RoutingModule} from './routing.module';
import {TabExampleComponent} from '../examples/ib-tabExample.component';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import { StoreModule } from '@ngrx/store';
import { counterReducer } from '../examples/redux-example/counter.reducer';
import {MyCounterComponent} from '../examples/redux-example/my-counter.component';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    TabExampleComponent,
    MyCounterComponent
  ],
  imports: [
    CommonModule,
    InobetaUiModule,
    RoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    FlexLayoutModule,
    BrowserModule,
    StoreModule.forRoot({ count: counterReducer }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
  ],
  exports: [
    FlexLayoutModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

}
