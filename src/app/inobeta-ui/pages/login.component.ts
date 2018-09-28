import {Component, OnChanges, SimpleChanges, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';
// import {ToasterService} from 'angular2-toaster';
import {SessionService} from '../auth/session.service';

// TODO angular2-toaster eliminato da package.json, quindi qui ci sono vari commenti per far partire l'app

@Component({
  selector: 'ib-login',
  template: `
    <!--<form [formGroup]="this.form" class="form-horizontal" role="form" (submit)="doLogin()">-->
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
        <div class="col-sm-2">
          <label class="control-label">{{ 'login.domain' | translate}}</label>
        </div>
        <div class="col-sm-10">
          <input type="text" class="form-control" formControlName="domain" placeholder="{{ 'login.domain' | translate}}">
        </div>
      </div>
      <div class="form-group">
        <div class="col-sm-offset-2 col-sm-10">
          <button type="submit" class="btn btn-primary">{{ 'login.do' | translate}}</button>
        </div>
      </div>
    <!--</form>-->

    
`
})
export class LoginComponent {
  form: FormGroup;


  // constructor(
  //   private srvSession: SessionService, private srvFormBuilder: FormBuilder, private srvRouter: Router, private srvToast: ToasterService
  // ) {
  //
  //
  //   this.form = this.srvFormBuilder.group({
  //     'username': new FormControl('', Validators.required),
  //     'password': new FormControl('', Validators.required),
  //     'domain': new FormControl('', Validators.required),
  //   });
  // }
  //
  // doLogin() {
  //   this.srvSession.login(this.form.value).subscribe(
  //     (ok) => {
  //       this.srvToast.pop('success', 'Login', 'Log in success');
  //       console.log('router', this.srvRouter);
  //       this.srvRouter.navigateByUrl('/quotes');
  //     },
  //     (err) => {
  //       this.srvToast.pop('error', 'Login', 'Email and/or password error');
  //     }
  //   );
  // }
} /* istanbul ignore next */
