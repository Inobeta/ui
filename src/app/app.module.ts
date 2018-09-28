import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {ISessionHandler} from './inobeta-ui/auth/session.reducer';
import {SharedModule} from './inobeta-ui/shared.module';


export interface IAppState {
  sessionHandler: ISessionHandler;
}




@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SharedModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
