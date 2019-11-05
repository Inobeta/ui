import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {Router} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LoginComponent} from './login.component';
import {TranslateModule} from '@ngx-translate/core';
import {SessionService} from '../auth/session.service';
import {MatSnackBar, MatSnackBarModule} from '@angular/material';

describe('LoginFormComponent', () => {

  const sessionServiceStub = {
    loginSuccess: true,
    login: jasmine.createSpy('Login Spy').and.callFake(() => {
      return {
        subscribe: (funcSucc, funcErr) => {
          if (sessionServiceStub.loginSuccess) {
            funcSucc();
          } else {
            console.log('CALLINGFAKE ON ERROR');
            funcErr();
          }
        }
      };
    })
  };

  const snackBarStub = {
    open: jasmine.createSpy('mock snack bar')
  };

  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  const routerSpy = { navigateByUrl: jasmine.createSpy('navigateByUrl')};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      declarations: [
        LoginComponent
      ],
      providers: [
        { provide: SessionService, useValue: sessionServiceStub },
        { provide: MatSnackBar, useValue: snackBarStub },
        { provide: Router, useValue: routerSpy },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    sessionServiceStub.login.calls.reset();
    snackBarStub.open.calls.reset();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should login correctly', () => {
    const email = component.form.controls['username'];
    const password = component.form.controls['password'];
    email.setValue('salvatore.niglio@inobeta.net');
    password.setValue('password');
    component.doLogin('/dashboard');
    expect(sessionServiceStub.login).toHaveBeenCalled();
    expect(sessionServiceStub.login).toHaveBeenCalledTimes(1);
    expect(sessionServiceStub.login).toHaveBeenCalledWith(Object({ username: 'salvatore.niglio@inobeta.net', password: 'password' }));
    expect(snackBarStub.open).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(1);
    expect (routerSpy.navigateByUrl).toHaveBeenCalledWith ('/dashboard');
  });


  it('should login fail', () => {
    const email = component.form.controls['username'];
    const password = component.form.controls['password'];
    email.setValue('ciao');
    password.setValue('ciao');
    sessionServiceStub.loginSuccess = false;
    component.doLogin('/dashboard');
    expect(sessionServiceStub.login).toHaveBeenCalled();
    expect(sessionServiceStub.login).toHaveBeenCalledTimes(1);
    expect(sessionServiceStub.login).toHaveBeenCalledWith(Object({ username: 'ciao', password: 'ciao' }));
    expect(snackBarStub.open).toHaveBeenCalled();
    // const result = snackBarStub.open();
    // expect(result).toBe(false);
  });
});
