import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import {ISessionHandler} from './inobeta-ui/auth/session.reducer';
import {InobetaUiModule} from './inobeta-ui/inobetaUi.module';
import {RoutingModule} from './routing.module';
import {TabExampleComponent} from '../examples/ib-tabExample.component';
import {TorrefazioneLoginComponent} from '../examples/torrefazioneLogin.component';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {TfButtonRedDirective} from '../examples/tfButtonRed.directive';
import {TfButtonGreenDirective} from '../examples/tfButtonGreen.directive';
import {TfInputTextDirective} from '../examples/tfInputText.directive';

export interface IAppState {
  sessionHandler: ISessionHandler;
}

@NgModule({
  declarations: [
    AppComponent,
    TabExampleComponent,
    TorrefazioneLoginComponent,
    TfButtonRedDirective,
    TfButtonGreenDirective,
    TfInputTextDirective
  ],
  imports: [
    CommonModule,
    InobetaUiModule,
    RoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    FlexLayoutModule
  ],
  exports: [
    FlexLayoutModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
