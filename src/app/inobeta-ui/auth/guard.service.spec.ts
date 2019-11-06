import { Router} from '@angular/router';
import {TestBed} from '@angular/core/testing';
import {AuthService} from './auth.service';
import {Guard} from './guard.service';
import {mockAuthService} from './mock';

describe('GuardService', () => {

  const routerSpy = { navigateByUrl: jasmine.createSpy('navigateByUrl')};
  const mockAuth = mockAuthService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: mockAuth},
        Guard
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
    const guard = TestBed.get(Guard);
    guard.canActivate();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(1);
    expect (routerSpy.navigateByUrl).toHaveBeenCalledWith ('login');
  });

  it('Guard should be use canActivate correctly', () => {
    const guard = TestBed.get(Guard);
    mockAuth['isNull'] = false;
    guard.canActivate();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(1);
    expect (routerSpy.navigateByUrl).toHaveBeenCalledWith ('login');
  });


});
