import {IbAuthService} from './auth.service';
import {TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import { IbAPITokens, IbSession } from './session.model';
import { IbStorageService, IbStorageTestModule } from '../../storage';

describe('IbAuthService', () => {
  let authService: IbAuthService<IbAPITokens>;
  let storageService: IbStorageService;

  const routerSpy = { navigate: jasmine.createSpy('navigate')};

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        IbAuthService
      ],
      imports: [
        IbStorageTestModule
      ]
    }).compileComponents();
    authService = TestBed.inject(IbAuthService);
    storageService = TestBed.inject(IbStorageService);
  });

  beforeEach(() => {
    routerSpy.navigate.calls.reset();
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  it('should be created with active session', () => {
    expect(authService).toBeTruthy();
  });

  it('should call local storage method', () => {
    const spy = spyOn(storageService, 'set').and.callThrough();
    authService.activeSession = new IbSession();
    authService.storeSession();
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should call local cookie method', () => {
    const spy = spyOn(storageService, 'set').and.callThrough();
    authService.activeSession = new IbSession();
    authService.cookieSession();
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should do logout', () => {
    const spy = spyOn(storageService, 'set').and.callThrough();
    authService.logout();
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(2);
  });

});
