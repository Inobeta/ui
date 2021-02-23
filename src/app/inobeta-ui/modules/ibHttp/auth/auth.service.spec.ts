import {AuthService} from './auth.service';
import {TestBed} from '@angular/core/testing';
import {CookiesStorageService, LocalStorageService} from 'ngx-store';
import {Router} from '@angular/router';

describe('AuthService', () => {

  const mockCookiesStorage = {
    empty: true,
    get: jasmine.createSpy('cook get Spy').and.callFake(() => {
      if (mockCookiesStorage.empty) {
        return null;
      } else {
        return {
          user: {
            username: 'prova',
            password: 'prova',
            rememberMe: true
          },
          userData: {
            prova: 'prova'
          },
          valid: true,
          authToken: 'ufwehliruui'
        };
      }
    }),
    set: jasmine.createSpy('cook set Spy').and.callFake(() => {
      return true;
    })
  };
  const mockLocalStorage = {
    empty: true,
    get: jasmine.createSpy('loc get Spy').and.callFake(() => {
      if (mockLocalStorage.empty) {
        return null;
      } else {
        return {
          user: {
            username: 'prova',
            password: 'prova',
            rememberMe: true
          },
          userData: {
            prova: 'prova'
          },
          valid: true,
          authToken: 'ufwehliruui'
        };
      }
    }),
    set: jasmine.createSpy('loc set Spy').and.callFake(() => {
      return true;
    })
  };
  const routerSpy = { navigate: jasmine.createSpy('navigate')};

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LocalStorageService, useValue: mockLocalStorage },
        { provide: CookiesStorageService, useValue: mockCookiesStorage },
        { provide: Router, useValue: routerSpy },
        AuthService
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    mockLocalStorage.get.calls.reset();
    mockLocalStorage.set.calls.reset();
    mockCookiesStorage.get.calls.reset();
    mockCookiesStorage.set.calls.reset();
    routerSpy.navigate.calls.reset();
  });

  it('should be created', () => {
    const authService = TestBed.get(AuthService);
    expect(authService).toBeTruthy();
  });

  it('should be created with active session', () => {
    mockCookiesStorage.empty = false;
    const authService = TestBed.get(AuthService);
    expect(authService).toBeTruthy();
  });

  it('should call local storage method', () => {
    const authService = TestBed.get(AuthService);
    authService.storeSession();
    expect(mockLocalStorage.set).toHaveBeenCalled();
    expect(mockLocalStorage.set).toHaveBeenCalledTimes(1);
  });

  it('should call local cookie method', () => {
    const authService = TestBed.get(AuthService);
    authService.cookieSession();
    expect(mockCookiesStorage.set).toHaveBeenCalled();
    expect(mockCookiesStorage.set).toHaveBeenCalledTimes(1);
  });

  it('should do logout', () => {
    const authService = TestBed.get(AuthService);
    authService.logout();
    expect(mockLocalStorage.set).toHaveBeenCalled();
    expect(mockLocalStorage.set).toHaveBeenCalledTimes(1);
    expect(mockCookiesStorage.set).toHaveBeenCalled();
    expect(mockCookiesStorage.set).toHaveBeenCalledTimes(1);
    /*FIXME why the navigate function call was removed?
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
    expect (routerSpy.navigate).toHaveBeenCalledWith (['/login']);*/
  });

});
