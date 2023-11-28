import { Router} from '@angular/router';
import {TestBed} from '@angular/core/testing';
import {IbAuthService} from './auth.service';
import {IbAuthGuard, IbLoginGuard} from './guard.service';

describe('IbAuthGuard & IbLoginGuard with activeSession null', () => {

  const mockAuthService = {activeSession: null};
  const routerSpy = { navigateByUrl: jasmine.createSpy('navigateByUrl')};

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: IbAuthService, useValue: mockAuthService},
        IbAuthGuard,
        IbLoginGuard
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    routerSpy.navigateByUrl.calls.reset();
  });

  it('IbAuthGuard should be created', () => {
    const guard = TestBed.inject(IbAuthGuard);
    expect(guard).toBeTruthy();
  });

  it('IbAuthGuard should be use canActivate ang return to login', () => {
    const lguard = TestBed.inject(IbAuthGuard);
    lguard.canActivate();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(1);
    expect (routerSpy.navigateByUrl).toHaveBeenCalledWith ('/login');
  });

  it('IbLoginGuard should be created', () => {
    const lguard = TestBed.inject(IbLoginGuard);
    expect(lguard).toBeTruthy();
  });

  it('IbLoginGuard should be use canActivate', () => {
    const lguard = TestBed.inject(IbLoginGuard);
    lguard.canActivate();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(0);
  });

});

describe('IbAuthGuard & IbLoginGuard with activeSession something', () => {

  const mockAuthService2 = {activeSession: 'user'};
  const routerSpy = { navigateByUrl: jasmine.createSpy('navigateByUrl')};

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: IbAuthService, useValue: mockAuthService2},
        IbAuthGuard,
        IbLoginGuard
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    routerSpy.navigateByUrl.calls.reset();
  });

  it('IbAuthGuard should be created', () => {
    const guard = TestBed.inject(IbAuthGuard);
    expect(guard).toBeTruthy();
  });

  it('IbAuthGuard should be use canActivate', () => {
    const lguard = TestBed.inject(IbAuthGuard);
    lguard.canActivate();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(0);
  });

  it('IbLoginGuard should be created', () => {
    const lguard = TestBed.inject(IbLoginGuard);
    expect(lguard).toBeTruthy();
  });

  it('IbLoginGuard should be use canActivate', () => {
    const lguard = TestBed.inject(IbLoginGuard);
    lguard.canActivate();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(1);
    expect (routerSpy.navigateByUrl).toHaveBeenCalledWith ('/dashboard');
  });

});
