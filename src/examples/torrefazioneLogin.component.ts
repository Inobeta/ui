import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'ib-login',
  template: `
    <div
      [formGroup]="form"
      class="formContainer">
      <div
        class="email"
        fxLayout
        fxLayout.xs="column"
        fxLayoutAlign="center"
        fxLayoutGap="0px"
        fxLayoutGap.xs="20px">
        <div fxFlex="30%" fxLayoutAlign="center">
          <label>E-mail</label>
        </div>
        <div fxFlex="70%" fxLayoutAlign="center">
          <input tfInputText id="username" type="text" formControlName="username" placeholder="{{ 'login.E-mail' | translate}}">
        </div>
      </div>
      <div
        class="password"
        fxLayout
        fxLayout.xs="column"
        fxLayoutAlign="center"
        fxLayoutGap="0px"
        fxLayoutGap.xs="20px">
        <div fxFlex="30%" fxLayoutAlign="center">
          <label>Password</label>
        </div>
        <div fxFlex="70%" fxLayoutAlign="center">
          <input tfInputText id="password" type="password" formControlName="password" placeholder="{{ 'login.Password' | translate}}">
        </div>
      </div>
      <div
        class="loginButton"
        fxLayout
        fxLayout.xs="column"
        fxLayoutAlign="center"
        fxLayoutGap.xs="0">
        <div fxFlex="100%"  fxLayoutAlign="center">
          <button tfButtonRed type="submit" class="button">LOGIN</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['torrefazioneLogin.css']
})
export class TorrefazioneLoginComponent{

  form: FormGroup;

  constructor(private srvFormBuilder: FormBuilder) {
    this.form = this.srvFormBuilder.group({
      'username': new FormControl('', Validators.required),
      'password': new FormControl('', Validators.required)
    });
  }

}
