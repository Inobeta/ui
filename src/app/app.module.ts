import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import {ISessionHandler} from './inobeta-ui/auth/session.reducer';
import {InobetaUiModule} from './inobeta-ui/inobetaUi.module';
import {RouterModule} from '@angular/router';

export interface IAppState {
  sessionHandler: ISessionHandler;
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    InobetaUiModule,
    RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
