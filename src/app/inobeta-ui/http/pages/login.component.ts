import {Component, Input} from '@angular/core';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {IbSessionService} from '../auth/session.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// TODO angular2-toaster eliminato da package.json, quindi qui ci sono vari commenti per far partire l'app

@Component({
  selector: 'ib-login',
  template: `
    <form [formGroup]="this.form" class="form-horizontal" role="form" (submit)="doLogin(path)">
      <div class="form-group">
        <div class="col-sm-2">
          <label class="control-label">{{ 'login.username' | translate}}</label>
        </div>
        <div class="col-sm-10">
          <input type="text" class="form-control" formControlName="username" placeholder="{{ 'login.username' | translate}}">
        </div>
      </div>
      <div class="form-group">
        <div class="col-sm-2">
          <label class="control-label">{{ 'login.password' | translate}}</label>
        </div>
        <div class="col-sm-10">
          <input type="password" class="form-control" formControlName="password" placeholder="{{ 'login.password' | translate}}">
        </div>
      </div>
      <div class="form-group">
        <div class="col-sm-offset-2 col-sm-10">
          <button type="submit" class="btn btn-primary">{{ 'login.do' | translate}}</button>
        </div>
      </div>
    </form>
  `
})
export class IbLoginComponent {

  @Input() path;
  form: FormGroup;

  constructor(
    private srvSession: IbSessionService,
    private srvFormBuilder: FormBuilder,
    private srvRouter: Router,
    private snackBar: MatSnackBar) {
    this.form = this.srvFormBuilder.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      rememberMe: new FormControl(false)
    });
  }

  doLogin(path) {
    this.srvSession.login(this.form.value).subscribe(
      () => {
        this.snackBar.open('Login success', null, {duration: 2000});
        this.srvRouter.navigateByUrl(path);
      },
      () => {
        this.snackBar.open('Login error', null, {duration: 2000});
      }
    );
  }
}

