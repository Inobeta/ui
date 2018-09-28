/*
import {TestBed, inject, async} from '@angular/core/testing';
import {LoginComponent} from './login.component';
import {MODULES} from '../../modules/index';
import {SessionService} from '../../services/auth/session.service';
import {MockBackend} from '@angular/http/testing';
import {BaseRequestOptions, ResponseOptions, Response, Http} from '@angular/http';
import {SERVICES} from '../../services/index';
import {RouterTestingModule} from '@angular/router/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import { ToasterService} from 'angular2-toaster';
import {ToasterServiceMock} from '../../testUtils/toasterServiceMock';
import {HttpClientService} from '../../services/http/httpclient.service';
import {w4tchRoutes} from '../../routing.module';
import {VIEWS} from '../index';

describe('LoginComponent', () => {

  const backendData = {};


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...SERVICES,
        MockBackend,
        BaseRequestOptions,
        {
          provide: HttpClientService,
          useFactory: (backend, options) => new Http(backend, options),
          deps: [MockBackend, BaseRequestOptions]
        }, {
          provide: ToasterService,
          useFactory: () => new ToasterServiceMock()
        }
      ],
      declarations: [
        ...VIEWS
      ],
      imports: [
        ...MODULES,
        RouterTestingModule.withRoutes(w4tchRoutes)
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.compileComponents();
  });


  it('should do success Login', async(inject(
    [SessionService, MockBackend], (service, mockBackend) => {
      expect(service).toBeDefined();
      mockBackend.connections.subscribe(conn => {
        conn.mockRespond(new Response(new ResponseOptions({ body: JSON.stringify(backendData) })));
      });

      const fixture = TestBed.createComponent(LoginComponent);
      const comp = fixture.debugElement.componentInstance;
      expect(comp).toBeTruthy();
      expect(comp.form).not.toBe(null);
      const notification = spyOn(comp.srvToast, 'pop').and.callThrough();
      const redirect = spyOn(comp.srvRouter, 'navigateByUrl').and.callThrough();
      comp.doLogin();
      expect(notification).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalled();
    })));



  it('should do fail Login', async(inject(
    [SessionService, MockBackend], (service, mockBackend) => {
      expect(service).toBeDefined();
      mockBackend.connections.subscribe(conn => {
        conn.mockError(new Response(new ResponseOptions({ body: JSON.stringify(backendData) })));
      });

      const fixture = TestBed.createComponent(LoginComponent);
      const comp = fixture.debugElement.componentInstance;
      expect(comp).toBeTruthy();
      expect(comp.form).not.toBe(null);
      const notification = spyOn(comp.srvToast, 'pop').and.callThrough();
      const redirect = spyOn(comp.srvRouter, 'navigateByUrl').and.callThrough();
      comp.doLogin();
      expect(notification).toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
    })));

});
*/
