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
            funcErr();
          }
        }
      };
    })
  };

  const snackBarStub = {
    success: true,
    open: jasmine.createSpy('mock snack bar').and.callFake(() => {
      return snackBarStub.success;
    })
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
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should login correctly', () => {
    spyOn(component, 'doLogin').and.callThrough();
    const email = component.form.controls['username'];
    const password = component.form.controls['password'];
    email.setValue('salvatore.niglio@inobeta.net');
    password.setValue('password');
    component.doLogin('/dashboard');
    expect(component.doLogin).toHaveBeenCalled();
    expect(component.doLogin).toHaveBeenCalledTimes(1);
    // mi aspetto che sia stato chiamato anche il servizio, con questi valori
    expect(sessionServiceStub.login).toHaveBeenCalled();
    expect(sessionServiceStub.login).toHaveBeenCalledTimes(1);
    expect(sessionServiceStub.login).toHaveBeenCalledWith(Object({ username: 'salvatore.niglio@inobeta.net', password: 'password' }));
    expect(snackBarStub.open).toHaveBeenCalled();
    const result = snackBarStub.open();
    expect(result).toBe(true);
    expect(routerSpy.navigateByUrl).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(1);
    expect (routerSpy.navigateByUrl).toHaveBeenCalledWith ('/dashboard');
  });

  it('should login fail', () => {
    spyOn(component, 'doLogin').and.callThrough();
    const email = component.form.controls['username'];
    const password = component.form.controls['password'];
    email.setValue('ciao');
    password.setValue('ciao');
    snackBarStub.success = false;
    component.doLogin('/dashboard');
    expect(component.doLogin).toHaveBeenCalled();
    expect(component.doLogin).toHaveBeenCalledTimes(1);
    expect(sessionServiceStub.login).toHaveBeenCalled();
    expect(sessionServiceStub.login).toHaveBeenCalledTimes(2);
    expect(sessionServiceStub.login).toHaveBeenCalledWith(Object({ username: 'ciao', password: 'ciao' }));
    const result = snackBarStub.open();
    expect(result).toBe(false);
  });
});
