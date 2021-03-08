import {TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {IbAuthService} from './auth.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {MatSnackBar} from '@angular/material';
import {IbSessionService} from './session.service';
import {IbHttpClientService} from '../http/http-client.service';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Store} from '@ngrx/store';
import {ISessionState} from './redux/session.reducer';
import {IbAuthTypes} from './session.model';
import {IbResponseHandlerService} from '../http/response-handler.service';
import {HttpClient} from '@angular/common/http';

describe('IbSession service test', () => {
  let sessionService;
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  const mockSnackBar = {
    open: jasmine.createSpy('open')
  };
  const mockAuthService = {
    activeSession: 'prova',
    storeSession: jasmine.createSpy('storeSession spy').and.callFake(() => {
      return true;
    }),
    cookieSession: jasmine.createSpy('storeSession spy').and.callFake(() => {
      return true;
    }),
    logout: () => {}
  };
  const routerSpy = { navigateByUrl: jasmine.createSpy('navigateByUrl')};
  let store: MockStore<{ activeSession: any }>;
  const initialState = { activeSession: 'fake' };
  let dispatchSpy;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: IbAuthService, useValue: mockAuthService},
        { provide: MatSnackBar, useValue: mockSnackBar},
        provideMockStore({ initialState }),
        IbHttpClientService,
        IbResponseHandlerService,
        IbSessionService
      ]
    }).compileComponents();
    httpClient = TestBed.get(HttpClient);
    httpMock = TestBed.get(HttpTestingController);
    store = TestBed.get<Store<ISessionState>>(Store);
    sessionService = TestBed.get(IbSessionService);
  });

  beforeEach(() => {
    routerSpy.navigateByUrl.calls.reset();
  });

  it('Should be created', () => {
    const svcSession = TestBed.get(IbSessionService);
    expect(svcSession).toBeTruthy();
  });

  it('Should be use correctly setAuthtype', () => {
    const svcSession = TestBed.get(IbSessionService);
    svcSession.setAuthtype();
  });

  it('should do login()', (done) => {
    dispatchSpy = spyOn(store, 'dispatch');
    sessionService.login({
      username: 'Luca',
      password: 'Luca123',
      rememberMe: true
    }, '/api/auth/login').subscribe(
      (response) => {
        expect(response).toEqual({
          id: 1,
          username: 'salvo',
          name: 'Salvatore',
          surname: 'Niglio',
          type: 2,
          is_active: true,
          email: 'salvatore.niglio@inobeta.net',
          created_at: '2019-10-23T15:35:08.500Z',
          updated_at: '2019-10-23T1b7lT_x96yDm2x4hw13KOrfziM60'
        });
        expect(mockAuthService.storeSession).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        done();
      });
    let req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toEqual('POST');
    req.flush({
      id: 1,
      username: 'salvo',
      name: 'Salvatore',
      surname: 'Niglio',
      type: 2,
      is_active: true,
      email: 'salvatore.niglio@inobeta.net',
      created_at: '2019-10-23T15:35:08.500Z',
      updated_at: '2019-10-23T1b7lT_x96yDm2x4hw13KOrfziM60'
    });
    httpMock.verify();
    expect(mockAuthService.storeSession).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();

    // WITH NO URL PASSED TO LOGIN METHOD

    sessionService.login({
      username: 'Luca',
      password: 'Luca123',
      rememberMe: true
    }).subscribe(
      (response) => {
        expect(response).toEqual({
          id: 1,
          username: 'salvo',
          name: 'Salvatore',
          surname: 'Niglio',
          type: 2,
          is_active: true,
          email: 'salvatore.niglio@inobeta.net',
          created_at: '2019-10-23T15:35:08.500Z',
          updated_at: '2019-10-23T1b7lT_x96yDm2x4hw13KOrfziM60'
        });
        expect(mockAuthService.storeSession).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalledTimes(2);
        done();
      });
    req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toEqual('POST');
    req.flush({
      id: 1,
      username: 'salvo',
      name: 'Salvatore',
      surname: 'Niglio',
      type: 2,
      is_active: true,
      email: 'salvatore.niglio@inobeta.net',
      created_at: '2019-10-23T15:35:08.500Z',
      updated_at: '2019-10-23T1b7lT_x96yDm2x4hw13KOrfziM60'
    });
    httpMock.verify();
    expect(mockAuthService.storeSession).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();

    // WITH AUTH = JWT

    sessionService.authType = IbAuthTypes.JWT;
    sessionService.login({
      username: 'Luca',
      password: 'Luca123',
      rememberMe: true
    }).subscribe(
      (response) => {
        expect(response).toEqual({
          id: 1,
          username: 'salvo',
          name: 'Salvatore',
          surname: 'Niglio',
          type: 2,
          is_active: true,
          email: 'salvatore.niglio@inobeta.net',
          created_at: '2019-10-23T15:35:08.500Z',
          updated_at: '2019-10-23T1b7lT_x96yDm2x4hw13KOrfziM60'
        });
        expect(mockAuthService.storeSession).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalledTimes(3);
        done();
      });
    req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toEqual('POST');
    req.flush({
      id: 1,
      username: 'salvo',
      name: 'Salvatore',
      surname: 'Niglio',
      type: 2,
      is_active: true,
      email: 'salvatore.niglio@inobeta.net',
      created_at: '2019-10-23T15:35:08.500Z',
      updated_at: '2019-10-23T1b7lT_x96yDm2x4hw13KOrfziM60'
    });
    httpMock.verify();
    expect(mockAuthService.storeSession).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();

    // WITH AUTH = BASIC AUTH

    sessionService.authType = IbAuthTypes.BASIC_AUTH;
    sessionService.login({
      username: 'Luca',
      password: 'Luca123',
      rememberMe: true
    }).subscribe(
      (response) => {
        expect(response).toEqual({
          id: 1,
          username: 'salvo',
          name: 'Salvatore',
          surname: 'Niglio',
          type: 2,
          is_active: true,
          email: 'salvatore.niglio@inobeta.net',
          created_at: '2019-10-23T15:35:08.500Z',
          updated_at: '2019-10-23T1b7lT_x96yDm2x4hw13KOrfziM60'
        });
        expect(mockAuthService.storeSession).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalledTimes(4);
        done();
      });
    req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toEqual('POST');
    req.flush({
      id: 1,
      username: 'salvo',
      name: 'Salvatore',
      surname: 'Niglio',
      type: 2,
      is_active: true,
      email: 'salvatore.niglio@inobeta.net',
      created_at: '2019-10-23T15:35:08.500Z',
      updated_at: '2019-10-23T1b7lT_x96yDm2x4hw13KOrfziM60'
    });
    httpMock.verify();
    expect(mockAuthService.storeSession).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();

    // WITH REMEMBER ME = FALSE

    sessionService.login({
      username: 'Luca',
      password: 'Luca123',
      rememberMe: false
    }).subscribe(
      (response) => {
        expect(response).toEqual({
          id: 1,
          username: 'salvo',
          name: 'Salvatore',
          surname: 'Niglio',
          type: 2,
          is_active: true,
          email: 'salvatore.niglio@inobeta.net',
          created_at: '2019-10-23T15:35:08.500Z',
          updated_at: '2019-10-23T1b7lT_x96yDm2x4hw13KOrfziM60'
        });
        expect(mockAuthService.storeSession).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalledTimes(5);
        done();
      });
    req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toEqual('POST');
    req.flush({
      id: 1,
      username: 'salvo',
      name: 'Salvatore',
      surname: 'Niglio',
      type: 2,
      is_active: true,
      email: 'salvatore.niglio@inobeta.net',
      created_at: '2019-10-23T15:35:08.500Z',
      updated_at: '2019-10-23T1b7lT_x96yDm2x4hw13KOrfziM60'
    });
    httpMock.verify();
    expect(mockAuthService.cookieSession).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('should do login() FAIL', (done) => {
    sessionService = TestBed.get(IbSessionService);
    sessionService.login({
      username: 'Luca',
      password: 'Luca123',
      rememberMe: true
    }).subscribe((res: any) => {
        expect(res.failure.error.type).toBe('ERROR_POST');
        done();
      }, () => {
        console.log('error');
        done();
      });
    const getRequest = httpMock.expectOne('/api/auth/login');
    getRequest.error(new ErrorEvent('ERROR_POST'));
    httpMock.verify();
  });

  it('Should be use correctly logout', () => {
    dispatchSpy = spyOn(store, 'dispatch');
    const svcSession = TestBed.get(IbSessionService);
    svcSession.logout();
    expect(dispatchSpy).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith( Object({ type: '[IbSession Service] Logout' }) );
    expect(routerSpy.navigateByUrl).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
    expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(1);
    expect(mockSnackBar.open).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledTimes(1);
  });
});
