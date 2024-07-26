import { Router} from '@angular/router';
import {TestBed} from '@angular/core/testing';
import {IbAuthGuard, IbLoginGuard} from './guard.service';
import { provideMockStore } from '@ngrx/store/testing';
import { IHttpStore } from '../store';

describe('IbAuthGuard & IbLoginGuard with no session', () => {

  const routerSpy = { navigateByUrl: jasmine.createSpy('navigateByUrl')};

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        provideMockStore({initialState: {
          ibHttpState: null
        }}),
        IbAuthGuard,
        IbLoginGuard,
        { provide: "ibHttpGUIDashboardUrl", useValue: "/home" },
        { provide: "ibHttpGUILoginUrl", useValue: "/login" },
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

  it('IbAuthGuard should be use canActivate and return to login', (done) => {
    const lguard = TestBed.inject(IbAuthGuard);
    lguard.canActivate().subscribe(() => {
      expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(1);
      expect (routerSpy.navigateByUrl).toHaveBeenCalledWith ('/login');
      done()
    })
  });

  it('IbLoginGuard should be created', () => {
    const lguard = TestBed.inject(IbLoginGuard);
    expect(lguard).toBeTruthy();
  });

  it('IbLoginGuard should be use canActivate', (done) => {
    const lguard = TestBed.inject(IbLoginGuard);
    lguard.canActivate().subscribe(() => {
      expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(0);
      done()
    })
  });

});

describe('IbAuthGuard & IbLoginGuard with a session', () => {

  const mockStore: IHttpStore = {
    loader: {
      showLoading: false,
      skipShow: false,
      pendingRequestList: []
    },
    session: {
      activeSession: {
        valid: true,
        serverData: null,
        user: {
          email: 'pippo',
          password: '',
          rememberMe: false
        }
      }
    }
  };
  const routerSpy = { navigateByUrl: jasmine.createSpy('navigateByUrl')};

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        provideMockStore({initialState: {
          ibHttpState: mockStore
        }}),
        IbAuthGuard,
        IbLoginGuard,
        { provide: "ibHttpGUIDashboardUrl", useValue: "/home" },
        { provide: "ibHttpGUILoginUrl", useValue: "/login" },
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

  it('IbAuthGuard should be use canActivate', (done) => {
    const lguard = TestBed.inject(IbAuthGuard);
    lguard.canActivate().subscribe(() => {
      expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(0);
      done()
    })
  });

  it('IbLoginGuard should be created', () => {
    const lguard = TestBed.inject(IbLoginGuard);
    expect(lguard).toBeTruthy();
  });

  it('IbLoginGuard should be use canActivate', (done) => {
    const lguard = TestBed.inject(IbLoginGuard);
    lguard.canActivate().subscribe(() => {
      expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(1);
      expect (routerSpy.navigateByUrl).toHaveBeenCalledWith ('/home');
      done()
    })
  });

});
