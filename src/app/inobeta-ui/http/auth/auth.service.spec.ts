import {IbAuthService} from './auth.service';
import {TestBed} from '@angular/core/testing';
import {CookiesStorageService, LocalStorageService} from 'ngx-store';
import {Router} from '@angular/router';
import { IbSession } from './session.model';

describe('IbAuthService', () => {
  let authService: IbAuthService;
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
        IbAuthService
      ]
    }).compileComponents();
    authService = TestBed.inject(IbAuthService);
  });

  beforeEach(() => {
    mockLocalStorage.get.calls.reset();
    mockLocalStorage.set.calls.reset();
    mockCookiesStorage.get.calls.reset();
    mockCookiesStorage.set.calls.reset();
    routerSpy.navigate.calls.reset();
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  it('should be created with active session', () => {
    mockCookiesStorage.empty = false;
    expect(authService).toBeTruthy();
  });

  it('should call local storage method', () => {
    authService.activeSession = new IbSession();
    authService.storeSession();
    expect(mockLocalStorage.set).toHaveBeenCalled();
    expect(mockLocalStorage.set).toHaveBeenCalledTimes(1);
  });

  it('should call local cookie method', () => {
    authService.activeSession = new IbSession();
    authService.cookieSession();
    expect(mockCookiesStorage.set).toHaveBeenCalled();
    expect(mockCookiesStorage.set).toHaveBeenCalledTimes(1);
  });

  it('should do logout', () => {
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
