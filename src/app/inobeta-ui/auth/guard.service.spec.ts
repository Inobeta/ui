import { Router} from '@angular/router';
import {TestBed} from '@angular/core/testing';
import {AuthService} from './auth.service';
import {Guard, LoginGuard} from './guard.service';

describe('Guard & LoginGuard with activeSession null', () => {

  const mockAuthService = {activeSession: null};
  const routerSpy = { navigateByUrl: jasmine.createSpy('navigateByUrl')};

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: mockAuthService},
        Guard,
        LoginGuard
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    routerSpy.navigateByUrl.calls.reset();
  });

  it('Guard should be created', () => {
    const guard = TestBed.get(Guard);
    expect(guard).toBeTruthy();
  });

  it('Guard should be use canActivate ang return to login', () => {
    const lguard = TestBed.get(Guard);
    lguard.canActivate();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(1);
    expect (routerSpy.navigateByUrl).toHaveBeenCalledWith ('login');
  });

  it('LoginGuard should be created', () => {
    const lguard = TestBed.get(LoginGuard);
    expect(lguard).toBeTruthy();
  });

  it('LoginGuard should be use canActivate', () => {
    const lguard = TestBed.get(LoginGuard);
    lguard.canActivate();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(0);
  });

});

describe('Guard & LoginGuard with activeSession something', () => {

  const mockAuthService2 = {activeSession: 'user'};
  const routerSpy = { navigateByUrl: jasmine.createSpy('navigateByUrl')};

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: mockAuthService2},
        Guard,
        LoginGuard
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    routerSpy.navigateByUrl.calls.reset();
  });

  it('Guard should be created', () => {
    const guard = TestBed.get(Guard);
    expect(guard).toBeTruthy();
  });

  it('Guard should be use canActivate', () => {
    const lguard = TestBed.get(Guard);
    lguard.canActivate();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(0);
  });

  it('LoginGuard should be created', () => {
    const lguard = TestBed.get(LoginGuard);
    expect(lguard).toBeTruthy();
  });

  it('LoginGuard should be use canActivate', () => {
    const lguard = TestBed.get(LoginGuard);
    lguard.canActivate();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(1);
    expect (routerSpy.navigateByUrl).toHaveBeenCalledWith ('dashboard');
  });

});
