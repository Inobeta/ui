import {AuthService} from './auth.service';
import {TestBed} from '@angular/core/testing';
import {CookiesStorageService, LocalStorageService} from 'ngx-store';
import {Router} from '@angular/router';
import {mockCookiesStorage, mockLocalStorage} from './mock';

describe('AuthService', () => {
  const mockLocal = mockLocalStorage;
  const mockCookies = mockCookiesStorage;
  const routerSpy = { navigate: jasmine.createSpy('navigate')};

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LocalStorageService, useValue: mockLocal },
        { provide: CookiesStorageService, useValue: mockCookies },
        { provide: Router, useValue: routerSpy },
        AuthService
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    mockLocal.get.calls.reset();
    mockLocal.set.calls.reset();
    mockCookies.get.calls.reset();
    mockCookies.set.calls.reset();
    routerSpy.navigate.calls.reset();
  });

  it('should be created', () => {
    const authService = TestBed.get(AuthService);
    expect(authService).toBeTruthy();
  });

  it('should be created with active session', () => {
    mockCookies.empty = false;
    const authService = TestBed.get(AuthService);
    expect(authService).toBeTruthy();
  });

  it('should call local storage method', () => {
    const authService = TestBed.get(AuthService);
    authService.storeSession();
    expect(mockLocal.set).toHaveBeenCalled();
    expect(mockLocal.set).toHaveBeenCalledTimes(1);
  });

  it('should call local cookie method', () => {
    const authService = TestBed.get(AuthService);
    authService.cookieSession();
    expect(mockCookies.set).toHaveBeenCalled();
    expect(mockCookies.set).toHaveBeenCalledTimes(1);
  });

  it('should do logout', () => {
    const authService = TestBed.get(AuthService);
    authService.logout();
    expect(mockLocal.set).toHaveBeenCalled();
    expect(mockLocal.set).toHaveBeenCalledTimes(1);
    expect(mockCookies.set).toHaveBeenCalled();
    expect(mockCookies.set).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
    expect (routerSpy.navigate).toHaveBeenCalledWith (['/login']);
  });

});
