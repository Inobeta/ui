import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {Router} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {IbLoginComponent} from './login.component';
import {TranslateModule} from '@ngx-translate/core';
import {IbSessionService} from '../auth/session.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    open: jasmine.createSpy('mock snack bar')
  };

  let component: IbLoginComponent;
  let fixture: ComponentFixture<IbLoginComponent>;
  const routerSpy = { navigateByUrl: jasmine.createSpy('navigateByUrl')};

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      declarations: [
        IbLoginComponent
      ],
      providers: [
        { provide: IbSessionService, useValue: sessionServiceStub },
        { provide: MatSnackBar, useValue: snackBarStub },
        { provide: Router, useValue: routerSpy },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    sessionServiceStub.login.calls.reset();
    snackBarStub.open.calls.reset();
    fixture = TestBed.createComponent(IbLoginComponent);
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
    sessionServiceStub.loginSuccess = true;
    component.doLogin('/dashboard');
    expect(sessionServiceStub.login).toHaveBeenCalled();
    expect(sessionServiceStub.login).toHaveBeenCalledTimes(1);
    expect(sessionServiceStub.login).toHaveBeenCalledWith(
      Object({ username: 'salvatore.niglio@inobeta.net', password: 'password', rememberMe: false })
      );
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
    expect(sessionServiceStub.login).toHaveBeenCalledWith(Object({ username: 'ciao', password: 'ciao', rememberMe: false }));
    expect(snackBarStub.open).toHaveBeenCalled();
  });

});
