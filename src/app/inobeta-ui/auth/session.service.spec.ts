import {TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MatSnackBar} from '@angular/material';
import {SessionService} from './session.service';
import {HttpClientService} from '../http/httpclient.service';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Store} from '@ngrx/store';
import {ISessionState} from './redux/session.reducer';
import {of} from 'rxjs';

describe('Session service test', () => {

  const fintoPost = {
    username: 'luca.c',
    name: 'Clausio',
    surname: 'Bisio',
    email: 'luca.casamenti@inobeta.net',
    type: 2
  };
  const mockSnackBar = {
    open: jasmine.createSpy('open')
  };
  const mockAuthService = {
    activeSession: 'prova'
  };
  const routerSpy = { navigateByUrl: jasmine.createSpy('navigateByUrl')};
  let store: MockStore<{ activeSession: any }>;
  const initialState = { activeSession: 'fake' };
  let dispatchSpy;
  const mockHttpClientService = {
    goPost: true,
    setAuthtype: jasmine.createSpy('setAuthtype spy'),
    post: jasmine.createSpy('post').and.returnValue(of(fintoPost))
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: mockAuthService},
        { provide: HttpClientService, useValue: mockHttpClientService},
        { provide: MatSnackBar, useValue: mockSnackBar},
        provideMockStore({ initialState }),
        SessionService
      ]
    }).compileComponents();
    store = TestBed.get<Store<ISessionState>>(Store);
  });

  beforeEach(() => {
    routerSpy.navigateByUrl.calls.reset();
  });

  it('Should be created', () => {
    const svcSession = TestBed.get(SessionService);
    expect(svcSession).toBeTruthy();
  });

  it('Should be use correctly setAuthtype', () => {
    const svcSession = TestBed.get(SessionService);
    svcSession.setAuthtype();
    expect(mockHttpClientService.setAuthtype).toHaveBeenCalled();
    expect(mockHttpClientService.setAuthtype).toHaveBeenCalledTimes(1);
  });

  it('Should be use correctly login', () => {
    dispatchSpy = spyOn(store, 'dispatch');
    const svcSession = TestBed.get(SessionService);
    svcSession.login({
      username: 'ciao',
      password: 'ciao',
      rememberMe: true
    });
   /* expect(dispatchSpy).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith( Object({ type: '[Session Service] Logout' }) );
    expect(routerSpy.navigateByUrl).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
    expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(1);
    expect(mockSnackBar.open).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledTimes(1);*/
  });

  it('Should be use correctly logout', () => {
    dispatchSpy = spyOn(store, 'dispatch');
    const svcSession = TestBed.get(SessionService);
    svcSession.logout();
    expect(dispatchSpy).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith( Object({ type: '[Session Service] Logout' }) );
    expect(routerSpy.navigateByUrl).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
    expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(1);
    expect(mockSnackBar.open).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledTimes(1);
  });
});
