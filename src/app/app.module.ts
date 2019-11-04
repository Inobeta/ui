import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import {ISessionHandler} from './inobeta-ui/auth/session.reducer';
import {InobetaUiModule} from './inobeta-ui/inobetaUi.module';
import {RoutingModule} from './routing.module';
import {TabExampleComponent} from '../examples/ib-tabExample.component';

export interface IAppState {
  sessionHandler: ISessionHandler;
}

@NgModule({
  declarations: [
    AppComponent,
    TabExampleComponent
  ],
  imports: [
    BrowserModule,
    InobetaUiModule,
    RoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
